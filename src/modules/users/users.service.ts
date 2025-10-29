import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { SerializedUser } from 'src/common/types';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-user-profile.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  private formatAvatarUrl(avatarPath: string): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    if (!avatarPath) {
      return `${baseUrl}/images/users/default_avatar.jpg`;
    }
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    return `${baseUrl}${avatarPath}`;
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async handleGetUserProfile(payload: any) {
    const user = await this.findUserByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = this.formatAvatarUrl(user.avatar);
    return user;
  }

  async handleUpdateUserProfile(
    user: any,
    updateProfileDto: UpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ) {
    // 1. Lấy user từ DB
    const userDB = await this.findUserByEmail(user.email);
    if (!userDB) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 2. Update các field được phép
    if (updateProfileDto.fullName !== undefined) {
      userDB.fullName = updateProfileDto.fullName;
    }

    if (updateProfileDto.phone !== undefined) {
      userDB.phone = updateProfileDto.phone;
    }

    // Cập nhật avatar nếu có file
    if (avatarFile) {
      const oldAvatar = userDB.avatar; // lưu tên ảnh cũ

      // Update avatar mới
      userDB.avatar = `/images/users/${avatarFile.filename}`;

      // 4. Xóa avatar cũ nếu không phải default
      const defaultAvatars = ['default_avatar.jpg', 'admin.jpg'];
      if (
        oldAvatar &&
        !defaultAvatars.some((name) => oldAvatar.includes(name))
      ) {
        const filePath = join(process.cwd(), 'public', oldAvatar); // path tuyệt đối
        try {
          await unlink(filePath);
        } catch (err) {
          console.warn('Không thể xóa ảnh cũ:', filePath, err.message);
          // không throw để user vẫn update được
        }
      }
    }

    // 3. Lưu thay đổi
    return await this.usersRepository.save(userDB);
  }

  async handleGetAllUsers() {
    const usersDB = await this.usersRepository.find();
    const users = usersDB.map((userDB) => new SerializedUser(userDB));
    return users;
  }

  async handleGetUser(id: number) {
    const userDB = await this.usersRepository.findOne({ where: { id } });
    return new SerializedUser(userDB);
  }

  async handleUpdateUser(id: number, adminUpdateUserDto: AdminUpdateUserDto) {
    // 1. Lấy user từ DB
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // 2. Cập nhật các field admin được phép
    if (adminUpdateUserDto.role) {
      user.role = adminUpdateUserDto.role;
    }

    if (adminUpdateUserDto.isActive !== undefined) {
      user.isActive = adminUpdateUserDto.isActive;
    }

    // 3. Lưu vào DB
    const updatedUser = await this.usersRepository.save(user);

    // 4. Trả về dữ liệu đã serialize
    return new SerializedUser(updatedUser);
  }

  async handleDeleteUser(id: number) {
    // 1. Lấy user
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 2. Soft delete (deactivate)
    user.isActive = false;

    // 3. Lưu thay đổi
    await this.usersRepository.save(user);

    return { message: 'Người dùng đã bị vô hiệu hóa' };
  }
}
