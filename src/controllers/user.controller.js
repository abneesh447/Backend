import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"; 



const generateAccessAndRefreshToken = async (userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false})

        console.log("upr",refreshToken)

        return { accessToken, refreshToken }
    }
    catch(error){
        throw new ApiError (500,"something went wrong while creating access and refreshToken")
    }
}


const registerUser = asyncHandler( async (req,res)=> {
    // get user details from frontend 
    // validate - not empty
    // check if user already exists : email,username
    // check for images and avatar
    // upload to cloudinary , avatar
    // creter user object - entry in db
    // response se password aur refresh token hata do
    // check for successful user creation
    // send response
    
    const {fullName,password,username,email} = req.body;
    // console.log("email:",email)

    // ------validation part

    // M-1: CHECK EVERY FIELD IS PRESENT OR NOT

    // if (fullName === "") {
    //     throw new ApiError(400,"Full name is required")
    // }

    // M-2:
    if (
        [fullName,password,username,email].some((field) => {
            return field?.trim() === ""
        })
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists : email,username

    // check will be done by user from userModel.js as it is made by mongoose it can directly contact mongo db

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username")
    }
    // console.log(req.files); 

    // checking for password length

    if(password.length < 6 || password.length > 14){
        throw new ApiError(400,"Password must be between 6 and 14 characters")
    }

    // check for images and avatar

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    console.log("avatarLocalPath:",avatarLocalPath)
    console.log("coverImageLocalPath:",coverImageLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    // upload to cloudinary , avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(500,"Error in uploading avatar image")
    }

    // creter user object - entry in db

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password,
        email
    })

    // checking if user successfully created or not(if created than remove pass, and refreshToken)
    // minus sign ko fields ke aage lgane wo fields htt jaati h

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // sending error if usermodel not created
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    // returning the response(api response me bhi hum status code bhej rhe h to bhejne na bhejna se koi frk nhi pdta ,
    // bss postman res.status se status code expect krta h isiliye bahr bhi bhej diye)

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered succesfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // req.body se data lo
    // email or username from user
    // validate it from the db ( user exist or not)
    // check the password
    // generate and give access and refreshtoken 
    // send cookie(yhi se access and refresh token dete h)
    // send response

    // data from req.body
    const {password,username,email} = req.body;

    // validating if email and username are empty or not
    if( !( username || email ) ) {
        throw new ApiError(400,"username or email is required")
    }

    //check for empty password
    if(!password){
        throw new ApiError(402,"password is required")
    }

    //validating if user exist in db or not
    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    // verifying user password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"invalid password !!")
    }

    // genrating access and refreshToken

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    // purane(uper wale user ke pass refreshToken nhi h)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //cookies frontend se na modify ho paye isiliye options object bnate h

    const options = {
        httpOnly: true,
        secure: true
    }

    // send response and cookies

    return res.status(201).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                refreshToken,         //cookies me bhejne ke baad idhr isiliye bhej rhe h jisse ki agr user i token se kuch krna chahe ya save krna chahe 
                accessToken
            },
            "User loggd in Successfully"
        )
    )



})

const logoutUser = asyncHandler( async (req, res)=> {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true  // taaki hme updated response mile
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )

})

const refreshAccessToken = asyncHandler( async ( req, res )=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify( incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh Token")
        }
    
        if( incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id)

        console.log("niche", refreshToken)
    
        return res.cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {   
                    accessToken,
                    refreshToken
                },
                "Access and Refresh Token updated successfully!!"
            )
        )
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "invalid refresh token" 
        )
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}