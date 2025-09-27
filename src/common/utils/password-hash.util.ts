import * as bcrypt from 'bcrypt';

export function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  plainPassword: string,
  hashPassword: string,
) {
  try {
    return await bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {
    console.log(error);
  }
}
