import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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

export {registerUser}