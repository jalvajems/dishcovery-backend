
export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: "Login successful.",
        LOGIN_FAILED: "Invalid credentials.",
        EMAIL_ALREADY_REGISTERED:'Email already Registered',
        REGISTER_SUCCESS: "User registered successfully.",
        REGISTER_FAILED: "User registering failed.",
        UNAUTHORIZED: "You are not authorized to perform this action.",
        TOKEN_NEEDED: 'refresh token needed',
        ACCESSTOKEN_MISSING: 'Accesss token is missing',
        INVALIDE_TOKEN:'Invalid or expired access token',
        INVALIDE_ROLE:'Invalid role',
        INVALID_CREDENTIALS:'Invalid credentials',
        INVALID_MAIL_PASS:'Invalid email or password',
        INVALID_OTP:'Invalid OTP!!',
        OTP_UNMATCH:'Otp is not found or not match',
        OTP_VERIFIED:'OTP verified!!',
        OTP_VERIFY_FAILED:'OTP verification failed',  
        OTP_RESENT:'OTP resent successfully!',
        CONFIRM_PASS_UNMATCH:'confirm password is not matching',  
        EMAIL_NOTFOUND:'Email is not exist',
        REFRESH_TOKEN_CREATION_FAILED:'refresh token creation failed',
        ACCESS_DENIED:'Access denied',

    },
    USER: {
        CREATED: "User created successfully.",
        UPDATED: "User updated successfully.",
        NOT_FOUND: "User not found.",
        USERID_NOTFOUND:'user id is missing',
        BLOCKED_BY_ADMIN:'Your account is blocked by admin!!',
    },
    ERROR: {
        STATUS_REQUIRED: "Status is required",
        UNKNOWN_ERROR: 'Unknown Error',
        INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
    },
    NOT_FOUND: "page not found",
    BLOCK_UPDATED: "Block is updated.",
    APPROVE_UPDATED: "Approve is updated.",

}
export const BLOG_MESSAGES = {
    FETCH_SUCCESS: 'fetched blog data successfully',
    CREATED:'blog created successfully',
    UPDATED:'blog updated successfully!',
    BLOG_NOT_FOUND:'No blogs found',
    DELETED:'blog deleted!!'
    
}
export const BOOKING_MESSAGES = {
    PAYMENT_REQUIRED: 'Payment required',
    BOOKING_CONFIRMED: 'Booking confirmed',
    CANCELLED: 'Booking cancelled successfully',
    NOT_FOUND:'Booking not found',

    
}
export const WORKSHOP_MESSAGES = {
    ATTENDANCE_UPDATED: 'attendance updated',
    CREATED:'Workshop created successfully',
    UPDATED:'Workshop updated successfully',
    APPROVE:'Workshop approved successfully',
    REJECTE: 'Workshop rejected successfully',
    SESSION_STARTED:'Workshop session started',
    SESSION_ENDED: 'Workshop session ended',
    SUBMITTED_FOR_APPROVAL:'Workshop submitted for approval',
    CANCELLING: 'Workshop cancelled processing started',
    CANCEL_REASON_REQUIRED:'Cancellation reason is required',
    RECENT_FETCHED:'Recent workshops fetched successfully',
    JOINED_SESSION: 'Joined session successfully',
    LEFT_SESSION:'Left session successfully',
    NOT_FOUND:'Workshop not found',

}

export const CHAT_MESSAGES = {
    OTHERID_REQUIRED: 'Other user ID and role are required',
    CREATE_CONVERSATION_FAILED: 'Failed to create/get conversation',
    FAILED_FETCH_CONVERSATION: 'Failed to fetch conversations',
    CONVERSATIONID_AND_CONTENT_REQUIRED: 'Conversation ID and content or file are required',
    FAILED_SEND_MESSAGE: 'Failed to send message',
    FAILED_FETCH_MESSAGE: 'Failed to fetch messages',
    MARKED_AS_READ: 'Messages marked as read',
    FAILED_MARKED_AS_READ: 'Failed to mark messages as read',
    MESSAGE_NOT_FOUND: 'Message not found or not authorized to delete',
    MESSAGE_DELETED: 'Message deleted successfully',
    FAILED_MESSAGE_DELETED: 'Failed to delete message',

}
export const CHEF_MESSAGES = {
    ENTERED_TO_CHEF_DASHBOARD: 'entered in to chef dashboard',
    PROFILE_CREATED: 'Profile created successfully',
    PROFILE_UPDATED: "Profie data updated!!",
    DATA_FETCHED: "Chef data fetched successfully",
    PROFILE_NOT_FOUND:"Chef profile not found",
    NOT_VERIFIED:' Chef is not verified by admin',
}
export const S3_MESSAGES = {
    S3URL_SEND: "s3 urls sended"
}
export const FOLLOW_MESSAGES = {
    CANNOT_FOLLOW_YOURSELF:"You cannot follow yourself",
    FOLLOWED_SUCCESS:"Followed successfully" ,
    UNFOLLOWED_SUCCESS:"Unfollowed successfully" ,
    
}

export const FOODIE_MESSAGES={
    ENTERED_SUCCESS:'Entered into foodie dashboard!!',
    RECIPEID_NOTFOUND:'recipe id is not found!',
    USERID_NOTFOUND:'user id is not found!',
    PROFILE_CREATED: 'Profile created successfully',
    PROFILE_UPDATED: "Profie data updated!!",
    DATA_FETCHED: "Foodie data fetched successfully",
    PROFILE_EXISTED:"profile already exist",
    UPDATED_NOT_FOUND:"Updated data not found",

}
export const FOODSPOT_MESSAGES={
    CREATED:'created successfully!',
    NOT_FOUND:'foodspot id not found',
    SPOT_FETCHED: 'successfully got spots',
    UPDATED:'successfully updated spot;',
    NEAR_SPOT_FETCHED:"nearby food spot fetched!!",
    FETCHED_ALL: 'got all food spot successfully',
    RECENT_FETCHED:'Recent food spots fetched successfully',
    LAT_LONG_REQUIRED:"latitude and longitude require"
}

export const NOTIFICATION_MESSAGES={
    ALL_MARK_AS_READ: "All notifications marked as read",
    ALL_DELETED:"All notifications deleted",
}
export const RECIPE_MESSAGES={
    RECIPEID_NOTFOUND:'Recipe id is missing',
    SAVED:"recipe saved!!",
    UNSAVED:"recipe unsaved!!",
    FETCH_SAVED:'fetched saved recipes',
    FETCHED:'fetched recipes successfully',
    RECENT_FETCHED:'Recent recipes fetched successfully',
    NOT_FOUND:'No recipes found!',
    CREATED:'Recipe created successfully!!',
    UPDATED:'Recipe updated successfully!!',
    DELETED:'Recipe deleted successfully!' ,

    
    
}
export const REVIEW_MESSAGES={
    CREATED:'review created successfully',
    REVIEW_FETCHED:'review recieved',
    ID_OR_TYPE_MISSING:'missing id or type',
    LIKED:'like toggled',
    DISLIKED:'dislike done',

}