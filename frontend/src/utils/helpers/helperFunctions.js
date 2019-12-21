export function generateCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  return `${year}-${month.length === 1 ? '0'+month : month}-${day.length === 1 ? '0'+day : day}`
}