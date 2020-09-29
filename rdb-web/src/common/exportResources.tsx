import XLSX from 'xlsx';
import _ from 'lodash';

export default function exportHosts(data: any, pickProperty: any, filename = 'resources') {
  const newData = _.map(data, (item) => {
    const baseProperty = ['id', 'uuid', 'ident', 'name', 'labels', 'note', 'extend', 'cate', 'tenant'];
    return _.pick(item, _.concat(baseProperty, pickProperty));
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(newData);

  XLSX.utils.book_append_sheet(wb, ws, filename);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
