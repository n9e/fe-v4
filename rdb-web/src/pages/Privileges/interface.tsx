export interface TreeNode {
  id: number,
  pid: number,
  ident: string,
  name: string,
  path: string,
  type: number,
  leaf: number,
  cate?: string,
  note?: string,
  children?: TreeNode[],
  icon_color: string,
  icon_char: string,
}
