import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, verifyCode } = await request.json();

    // POST requests generally send data in encoded format
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        {
          status: 404, // 404 for not found
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Compare OTP
    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeExpired = new Date(user.verifyCodeExpiry) < new Date(); // `isCodeExpired` should be true if the code has expired

    // console.log(isCodeValid, user.verifyCode, verifyCode);
    // console.log(new Date(user.verifyCodeExpiry), new Date());
    // console.log(isCodeExpired)
    
    if (!isCodeExpired && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return new Response(
        JSON.stringify({
          success: true,
          message: "User verified successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } 
    
    if (isCodeExpired) {
      // If the code is expired
      return new Response(
        JSON.stringify({
          success: false,
          message: "Code has expired. Please sign up again to receive a new code.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Incorrect code
      return new Response(
        JSON.stringify({
          success: false,
          message: "The code is incorrect. Please try again.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error verifying code", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error verifying code",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
