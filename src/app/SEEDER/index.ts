
import config from "../config";
import { USER_ROLE, UserStatus } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const superUser = {
  userId: 'OF-0001',
  fullName: 'OF',
  email: 'faruk@gmail.com',
  password: config.super_admin_password as string,
  role: USER_ROLE.superAdmin,
  status: UserStatus.ACTIVE,
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const isSuperAdminExits = await User.findOne({
    role: USER_ROLE.superAdmin,
  });

  if (!isSuperAdminExits) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
