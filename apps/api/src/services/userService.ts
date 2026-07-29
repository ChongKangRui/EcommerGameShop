import { registerDataSchema } from "@ecom/shared/src/registerDataSchema";
import { loginDataSchema } from "@ecom/shared/src/loginDataSchema";
import { type UserInfo } from "@ecom/shared/src/type/user";
import { type ServiceResult } from "@ecom/shared/src/type/service";
import { userRepository } from "src/repositories/userRepository";
import { passwordHelper } from "src/utils/passwordHelper";
import { generateToken } from "src/utils/jwtHelper";
import { type Logger } from "src/utils/loggerHelper";

const getUserData = (row: any): UserInfo => {
  const { first_name, last_name, email, address, role } = row;
  return { first_name, last_name, email, address, role };
};

export const userService = {
  async register(body: unknown, log: Logger): Promise<ServiceResult<{ message: string }>> {
    const validationResult = registerDataSchema.safeParse(body);
    if (!validationResult.success) {
      log.warn("Validation failed for registration", { errors: validationResult.error.issues });
      return { ok: false, status: 400, error: "Validation failed", details: validationResult.error.issues };
    }

    const { firstName, lastName, email, password, streetAddress, city, postalCode } = validationResult.data;
    const address = `${streetAddress}, ${city}, ${postalCode}`;
    const passwordHash = await passwordHelper.hash(password);

    try {
      await userRepository.insertUser({ firstName, lastName, email, passwordHash, address, role: "customer" });
    } catch (e: any) {
      if (e.code === "23505") {
        log.warn(`Registration failed - email already registered: ${email}`);
        return { ok: false, status: 409, error: "Email already registered" };
      }
      throw e;
    }

    log.info(`User registered successfully`, { email });
    return { ok: true, data: { message: "Registration successful" } };
  },

  async login(body: unknown, log: Logger): Promise<ServiceResult<{ user: UserInfo; token: string }>> {
    const validationResult = loginDataSchema.safeParse(body);
    if (!validationResult.success) {
      log.warn("Validation failed for login");
      return { ok: false, status: 400, error: "Invalid email or password", details: validationResult.error.issues };
    }

    const { email, password, rememberMe } = validationResult.data;
    const selectedUser = await userRepository.findUserByEmail(email);

    if (!selectedUser) {
      log.warn(`Login failed - no user found for email`);
      return { ok: false, status: 401, error: "Invalid email or password" };
    }

    const match = await passwordHelper.compare(password, selectedUser.password);
    if (!match) {
      log.warn(`Login failed - password mismatch`, { userId: selectedUser.user_id });
      return { ok: false, status: 401, error: "Invalid email or password" };
    }

    const token = generateToken(selectedUser.user_id, selectedUser.role, rememberMe);
    log.info(`User logged in`, { userId: selectedUser.user_id });
    return { ok: true, data: { user: getUserData(selectedUser), token } };
  },

  async verifyUser(userId: string, log: Logger): Promise<ServiceResult<{ user: UserInfo }>> {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      log.warn(`Verify failed - user not found`, { userId });
      return { ok: false, status: 401, error: "User not found" };
    }
    return { ok: true, data: { user: getUserData(user) } };
  },

  async updateUserInfo(
    userId: string,
    body: { firstName: string; lastName: string; email: string; address: string },
    log: Logger,
  ): Promise<ServiceResult<{ message: string }>> {
    try {
      await userRepository.updateUserInfo(userId, body);
    } catch (e: any) {
      if (e.code === "23505") {
        log.warn(`Update user info failed - duplicate`, { userId });
        return { ok: false, status: 409, error: "Update userInfo failed" };
      }
      throw e;
    }

    log.info(`User info updated`, { userId });
    return { ok: true, data: { message: "Update Success" } };
  },

  async updatePassword(
    userId: string,
    body: { oldPassword: string; newPassword: string },
    log: Logger,
  ): Promise<ServiceResult<{ message: string }>> {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      log.warn(`Update password failed - user not found`, { userId });
      return { ok: false, status: 401, error: "User not found" };
    }

    const match = await passwordHelper.compare(body.oldPassword, user.password);
    if (!match) {
      log.warn(`Update password failed - incorrect current password`, { userId });
      return { ok: false, status: 401, error: "Incorrect current password" };
    }

    const newHash = await passwordHelper.hash(body.newPassword);
    await userRepository.updatePassword(userId, newHash);

    log.info(`Password updated`, { userId });
    return { ok: true, data: { message: "Update Success" } };
  },
};