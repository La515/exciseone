const csvUrl = 'https://raw.githubusercontent.com/HKUST-VISLab/coding-challenge/master/temperature_daily.csv';

let temperatureData = [];
let years = [];  // 添加全局变量
let months = {}
let isMaxTemp = true;  // 默认显示最大温度

// 使用 PapaParse 解析 CSV 数据
function fetchData() {
    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            // 解析 CSV 数据
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: function(results) {
                    temperatureData = results.data; // 保存解析后的数据
                    processData(); // 处理数据并更新矩阵
                }
            });
        })
        .catch(error => console.error('加载 CSV 数据时出错:', error));
}


function processData() {
    years = Array.from(new Set(temperatureData.map(item => new Date(item.date).getFullYear()))).sort();

    // 初始化 months 对象
    months = {};
    years.forEach(year => {
        months[year] = Array(12).fill(null).map(() => []);  // 为每年初始化 12 个月的数组
    });

    //months = Array(12).fill(null).map(() => []);
    // 解析温度数据，将每年的每个月数据填充到相应的数组中
    temperatureData.forEach(item => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.getMonth(); // 月份是从0到11，所以需要转换
        if (months[year]) {
            months[year][month] = {
                max_temperature: item.max_temperature,
                min_temperature: item.min_temperature};
                //3rd if (!months[month][year]) {
            //months[month][year] = { max_temperature: item.max_temperature, min_temperature: item.min_temperature };
        }
        //2nd if (!years.includes(year)) years.push(year);
        //const temp = isMaxTemp ? item.max_temperature : item.min_temperature;
        //months[month].push(temp);

        //1st months[month].push(item.max_temperature);  // 使用最大温度（可以根据需要切换为最小温度）
    });

    createMatrix(years,months); // 创建矩阵
    createColorLegend(); // 创建颜色图例
}

function createMatrix(years, months) {
    const matrixContainer = document.getElementById('matrix');
    matrixContainer.innerHTML = '';  // 清空之前的矩阵内容

    // 生成纵轴（月份）
    const yAxisContainer = document.getElementById('yAxis');
    yAxisContainer.innerHTML = '';  // 清空之前的纵轴内容
    const monthsNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    monthsNames.forEach(month => {
        const monthDiv = document.createElement('div');
        monthDiv.innerText = month;
        yAxisContainer.appendChild(monthDiv);
    });

    // 生成横轴（年份）
    const xAxisContainer = document.getElementById('xAxis');
    xAxisContainer.innerHTML = '';  // 清空之前的横轴内容
    years.forEach(year => {
        const yearDiv = document.createElement('div');
        yearDiv.innerText = year;
        xAxisContainer.appendChild(yearDiv);
    });

    // 生成矩阵中的温度单元格
    monthsNames.forEach((monthData, monthIndex) => {
        years.forEach((year, yearIndex) => {
            const temp = isMaxTemp ? months[year][monthIndex].max_temperature : months[year][monthIndex].min_temperature;

            if (temp !==undefined) {
                const color = getColorFromTemperature(temp);
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.backgroundColor = color;
                cell.setAttribute('data-tooltip', `年份：${year}, 月份：${monthIndex + 1}, 温度：${temp}°C`);
                //cell.setAttribute('data-tooltip', `日期：${formatDate(year, monthIndex)}, 温度：${temp}°C`);
                matrixContainer.appendChild(cell);
                // 设置单元格的位置
                const cellIndex = (monthIndex * years.length) + yearIndex;
                matrixContainer.appendChild(cell);
            }
        });
    });
}

function getColorFromTemperature(temp) {
    if (temp < 15) {
        return '#a0c6e5';
    } else if (temp < 20) {
        return '#f7b7a3';
    } else if (temp < 25) {
        return '#f6b545';
    }else if (temp < 30) {
        return '#f69845';
    }else if (temp < 35) {
        return '#f67445';
    }else if (temp < 40) {
        return '#f64545';}
}

function formatDate(year, monthIndex) {

    return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
}

document.getElementById('toggleTemp').addEventListener('click', () => {
    // 切换 isMaxTemp 的值
    isMaxTemp = !isMaxTemp;
    const button = document.getElementById('toggleTemp');
    //if (button.innerText === '显示最大温度') {
        //button.innerText = '显示最小温度';
   // } else {
      //  button.innerText = '显示最大温度';
   // }
    //processData();  // 重新处理数据并更新矩阵
    // 切换按钮文本
    button.innerText = isMaxTemp ? '显示最小温度' : '显示最大温度';

    // 重新渲染矩阵
    createMatrix(years, months);
});



function createColorLegend() {
    const colorLegendContainer = document.getElementById('colorLegend');
    colorLegendContainer.innerHTML = '';  // 清空原有颜色图例

    const legendColors = [
        { color: '#a0c6e5', label: '< 15°C' },
        { color: '#f7b7a3', label: '15°C - 20°C' },
        { color: '#f6b545', label: '20°C-25℃' },
        {color: '#f69845',label: '25℃-30℃'},
        {color: '#f67445',label: '30℃-35℃'},
        {color: '#f64545',label: '>35℃'}
    ];

    legendColors.forEach(legend => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = legend.color;
        colorDiv.innerText = legend.label;
        colorLegendContainer.appendChild(colorDiv);
    });
}

fetchData();