import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, verifyCode } = await request.json();

    // post generally send in encoded format
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 500,
        }
      );
    }

    // now to compare otp
    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeExpired && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    } else if (isCodeExpired) {
      // if code date is expired
      return Response.json(
        {
          success: false,
          message: "Code has been expired. Please sign up again to verify code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Code is incorrect. Please fill it carefully",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("error verifing code", error);
    return Response.json(
      {
        success: false,
        message: "error verifying code ",
      },
      { status: 500 }
    );
  }
}
