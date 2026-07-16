export type UserInfo = {

  first_name: string;
  last_name: string;
  email: string;
  address: string;
  role: string;

};

export type UserLoginRespawn = {
    user:UserInfo;
    token: string
}