import { onRequest as __api_chat_data_js_onRequest } from "/workspaces/ddfashion/functions/api/chat-data.js"
import { onRequest as __api_imagekit_auth_js_onRequest } from "/workspaces/ddfashion/functions/api/imagekit-auth.js"
import { onRequest as __api_imagekit_upload_js_onRequest } from "/workspaces/ddfashion/functions/api/imagekit-upload.js"
import { onRequest as __api_send_otp_js_onRequest } from "/workspaces/ddfashion/functions/api/send-otp.js"
import { onRequest as __api_store_data_js_onRequest } from "/workspaces/ddfashion/functions/api/store-data.js"
import { onRequest as __api_user_session_js_onRequest } from "/workspaces/ddfashion/functions/api/user-session.js"
import { onRequest as __api_verify_otp_js_onRequest } from "/workspaces/ddfashion/functions/api/verify-otp.js"

export const routes = [
    {
      routePath: "/api/chat-data",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_chat_data_js_onRequest],
    },
  {
      routePath: "/api/imagekit-auth",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_imagekit_auth_js_onRequest],
    },
  {
      routePath: "/api/imagekit-upload",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_imagekit_upload_js_onRequest],
    },
  {
      routePath: "/api/send-otp",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_send_otp_js_onRequest],
    },
  {
      routePath: "/api/store-data",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_store_data_js_onRequest],
    },
  {
      routePath: "/api/user-session",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_user_session_js_onRequest],
    },
  {
      routePath: "/api/verify-otp",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_verify_otp_js_onRequest],
    },
  ]