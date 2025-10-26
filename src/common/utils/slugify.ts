export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/đ/g, 'd') // thay đ -> d
    .replace(/Đ/g, 'd') // thay Đ -> d
    .normalize('NFD') // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // khoảng trắng -> dấu gạch ngang
    .replace(/[^a-z0-9-]/g, '') // bỏ ký tự lạ
    .replace(/--+/g, '-'); // bỏ gạch ngang thừa
}
