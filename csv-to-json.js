/**
 * 通用 CSV → JSON 转换脚本
 *
 * 用法：node csv-to-json.js <输入.csv> [输出.json]
 * 示例：node csv-to-json.js 德语介词_C1知识库.csv prepositions-data.json
 *
 * 如果没有指定输出文件名，会自动生成（将 .csv 替换为 -data.json）
 */

const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('用法: node csv-to-json.js <输入.csv> [输出.json]');
    console.log('示例: node csv-to-json.js 新知识库.csv 新知识库-data.json');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.csv$/i, '-data.json');

// 检查输入文件是否存在
if (!fs.existsSync(inputFile)) {
    console.error(`错误: 找不到文件 "${inputFile}"`);
    process.exit(1);
}

// 读取 CSV
const csv = fs.readFileSync(inputFile, 'utf8').trim();
if (!csv) {
    console.error('错误: CSV 文件为空');
    process.exit(1);
}

// 解析 CSV（正确处理引号内的逗号和换行）
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                // 双引号转义 "" → "
                if (text[i + 1] === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n') {
                currentRow.push(currentField.trim());
                if (currentRow.length > 1 || currentRow[0] !== '') {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
            } else if (char === '\r') {
                // 跳过 Windows 换行符的 \r
            } else {
                currentField += char;
            }
        }
    }

    // 处理最后一行
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || currentRow[0] !== '') {
            rows.push(currentRow);
        }
    }

    return rows;
}

const rows = parseCSV(csv);

if (rows.length < 2) {
    console.error('错误: CSV 文件没有数据行（至少需要表头 + 1 行数据）');
    process.exit(1);
}

// 第一行是表头
const headers = rows[0].map(h => h.trim());

// 转换为 JSON 对象数组
const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
        obj[header] = (row[i] || '').trim();
    });
    return obj;
});

// 写入 JSON 文件（UTF-8，格式化输出）
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ 转换成功！`);
console.log(`   输入: ${inputFile} (${rows.length - 1} 条记录)`);
console.log(`   输出: ${outputFile}`);
console.log(`   字段: ${headers.join(', ')}`);