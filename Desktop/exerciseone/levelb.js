const csvUrl='https://raw.githubusercontent.com/HKUST-VISLab/coding-challenge/master/temperature_daily.csv';

let temperatureData = [];
let years = [];  // 添加全局变量
let months = {}
let isMaxTemp = true;  // 默认显示最大温度

function fetchData() {
    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            // 解析 CSV 数据
            Papa.parse(csvText, {
                header: true,
                //skipEmptyLines: true,
                dynamicTyping: true,
                complete: function(results) {
                    temperatureData = results.data; // 保存解析后的数据
                    processData(); // 处理数据并更新矩阵
                }
            });
        })
        .catch(error => console.error('加载 CSV 数据时出错:', error));
}

function filterData(data) {
    return data.filter(row => {
        return new Date(row.date) >= new Date('2008-01-01') && new Date(row.date) <= new Date('2017-10-28');

    });
}

function processData() {
    temperatureData=filterData(temperatureData);
    years = Array.from(new Set(temperatureData.map(item => new Date(item.date).getFullYear()))).sort();

    // 初始化 months 对象
    months = {};
    years.forEach(year => {
        months[year] = Array(12).fill(null).map(() => ({ dailyTemperature: [] }));
    });
    // 解析温度数据，将每年的每个月数据填充到相应的数组中
    temperatureData.forEach(item => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.getMonth(); // 月份是从0到11，所以需要转换
        const dailyTemperature = isMaxTemp ? item.max_temperature : item.min_temperature;
  
            if (months[year] && months[year][month]) {
                const day = date.getDate() - 1; // 日期从1开始，但数组是从0开始，所以需要减1
                if (!months[year][month].dailyTemperature) {
                    months[year][month].dailyTemperature = []; // 初始化 dailyTemperature 数组
                }
                months[year][month].dailyTemperature[day] = dailyTemperature;
                  
            }
        
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
            const monthInfo = months[year][monthIndex];
            if (!monthInfo || !Array.isArray(monthInfo.dailyTemperature)) return;  // 检查 dailyTemperature 是否是有效数组
            const temp = isMaxTemp ? Math.max(...monthInfo.dailyTemperature) : (monthInfo.dailyTemperature.length > 0 ? Math.min(...monthInfo.dailyTemperature) : null);

            const temperatures=months[year][monthIndex].dailyTemperature || [];

            if (temp !==undefined) {
                const color = getColorFromTemperature(temp);
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.backgroundColor = color;
                cell.setAttribute('data-tooltip', `年份：${year}, 月份：${monthIndex + 1}, 温度：${temp}°C`);
                matrixContainer.appendChild(cell);

                const canvas = document.createElement('canvas');
                canvas.width = 100;  // 设置canvas宽度
                canvas.height = 50; // 设置canvas高度
                cell.appendChild(canvas);

                const daysInMonth = new Date(year,monthIndex +1,0).getDate();
                const monthLabels = Array.from({length:daysInMonth},(_,i) => i + 1)
                const monthData = monthInfo.dailyTemperature.slice(0, daysInMonth);
                // 绘制折线图
                const ctx = canvas.getContext('2d');
                if (monthData.length > 0) {
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: monthLabels,
                            datasets: [{
                                label:" ",
                                data: monthData, // 每日温度数据
                                borderColor: '#4CAF50',
                                fill: false,
                                borderWidth: 1,
                                lineTension: 0.1, // 设置折线的平滑度，值越大越平滑，值越小则起伏越明显
                                pointRadius: 0, // 设置每个数据点的大小
                            }]
                        },
                        options: {
                            responsive: false,
                            scales: {
                                x: { ticks: { display: false }, grid: { display: false } },
                                y: { ticks: { display: false }, grid: { display: false } }
                            }
                        }
                    });
                }
            }
        });
    });
}

function getColorFromTemperature(temp) {
    if (temp < 4) {return '#00bfff';} 
    else if (temp < 8) {return '#87cefa';} 
    else if (temp < 12) {return '#87ceeb';}
    else if (temp < 16) {return '#afeeee';}
    else if (temp < 20) {return '#98fb98';}
    else if (temp < 24) {return '#adff2f';}
    else if (temp < 28) {return 'ffffe0' ;}
    else if (temp < 32) {return 'ffd700' ;}
    else if (temp < 36) {return 'ffa500' ;}
    else if (temp < 40) {return 'ff4500' ;}
}

function formatDate(year, monthIndex) {

    return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
}

document.getElementById('toggleTemp').addEventListener('click', () => {
    // 切换 isMaxTemp 的值
    isMaxTemp = !isMaxTemp;
    const button = document.getElementById('toggleTemp');
    button.innerText = isMaxTemp ? '显示最小温度' : '显示最大温度';
    createMatrix(years, months);
});



function createColorLegend() {
    const colorLegendContainer = document.getElementById('colorLegend');
    colorLegendContainer.innerHTML = '';  // 清空原有颜色图例

    const legendColors = [
        { color: '#00bfff', label: '< 4°C' },
        { color: '#87cefa', label: '4°C  - 8°C' },
        { color: '#87ceeb', label: '8°C  - 12°C' },
        { color: '#afeeee', label: '12°C - 16°C ' },
        { color: '#98fb98', label: '16°C - 20°C' },
        { color: '#adff2f', label: '20°C - 24°C' },
        { color: '#ffffe0', label: '24°C - 28°C' },
        { color: '#ffd700', label: '28°C - 32°C' },
        { color: '#ffa500', label: '32°C - 36°C' },
        { color: '#ff4500', label: '36°C - 40°C' },
    ];

    legendColors.forEach(legend => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = legend.color;
        colorDiv.innerText = legend.label;
        colorLegendContainer.appendChild(colorDiv);
    });
}

fetchData();