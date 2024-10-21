import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    // Check if user already exists of same username
    const existingUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists of same email
    const existingUserByEmail = await UserModel.findOne({
      email,
    });

    if (existingUserByEmail) {
      if(existingUserByEmail.isVerified) {
        return Response.json(
            {
              success: false,
              message: "User already exists with this email.",
            },
            { status: 400 }
          );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await existingUserByEmail.save();
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate otp
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate otp expiry
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Create new user
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry,
    });
    await newUser.save();

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if(!emailResponse.success) {
        return Response.json(
            {
              success: false,
              message: emailResponse.message,
            },
            {
              status: 500,
            }
          );    
    }

    return Response.json(
        {
          success: true,
          message: "User registered successfully.",
        },
        {
          status: 201,
        }
    );
    
  } catch (error) {
    console.error("Error registering user :", error);
    return Response.json(
      {
        success: false,
        message: "Failed to register user.",
      },
      { status: 500 }
    );
  }
}
