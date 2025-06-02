// 初始化地图
var map = new AMap.Map('mapContainer', {
    zoom: 11,
    center: [115.892111, 28.676493],
    layers: [new AMap.TileLayer()],
    viewMode: '3D',  // 设置为3D视角
    pitch: 30,       // 设置初始俯仰角度
    rotation: 0,     // 设置初始旋转角
    buildingAnimation: true, // 楼块出现是否带动画
    expandZoomRange: true,   // 是否允许高级别缩放
    zooms: [3, 20]           // 设置地图级别范围
});

// 新增路况图层
var trafficLayer = new AMap.TileLayer.Traffic({
    zIndex: 10
});

// 添加3D建筑物图层
var buildings = new AMap.Buildings({
    zooms: [14, 20],
    zIndex: 10,
    heightFactor: 2 // 2倍高度，让建筑物更明显
});

// 确保在3D视角下添加建筑物图层
if (map.getStatus().viewMode === '3D') {
    try {
        console.log('初始化时添加3D建筑物图层');
        map.add(buildings);
    } catch (e) {
        console.error('初始化时添加建筑物图层出错:', e);
    }
}

// 导航相关变量
var driving;
var riding;
var walking;
var navigationMarker;
var navigationPath;
var navigationInfoWindow;
var isNavigating = false;
var customLocationMarker; // 自选位置标记
var destinationMarker; // 目的地标记

// 3D视角控制相关变量
var isPitchControlVisible = false;

// 搜索框面板相关变量
var isSearchBoxMinimized = false;

// 添加搜索框面板切换按钮
function addSearchBoxToggleButton() {
    var searchBox = document.querySelector('.search-box');
    var toggleButton = document.createElement('div');
    toggleButton.className = 'search-box-toggle-button';
    toggleButton.innerHTML = '▼';
    toggleButton.onclick = function() {
        isSearchBoxMinimized = !isSearchBoxMinimized;
        if (isSearchBoxMinimized) {
            searchBox.classList.add('minimized');
            toggleButton.innerHTML = '◀'; // 改为左箭头，避免变形
            
            // 隐藏面板内容
            var panelContent = searchBox.querySelectorAll(':not(.search-box-toggle-button)');
            panelContent.forEach(function(element) {
                element.style.display = 'none';
            });
        } else {
            searchBox.classList.remove('minimized');
            toggleButton.innerHTML = '▼';
            
            // 显示面板内容
            var panelContent = searchBox.querySelectorAll(':not(.search-box-toggle-button)');
            panelContent.forEach(function(element) {
                element.style.display = '';
            });
        }
    };
    
    searchBox.appendChild(toggleButton);
}

// 添加3D视角俯仰角控制器
function add3DPitchControl() {
    var pitchControlContainer = document.createElement('div');
    pitchControlContainer.className = 'pitch-control-container';
    pitchControlContainer.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        padding: 10px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    
    // 添加标题
    var title = document.createElement('div');
    title.textContent = '3D视角控制';
    title.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
    `;
    pitchControlContainer.appendChild(title);
    
    // 添加俯仰角滑块
    var pitchLabel = document.createElement('div');
    pitchLabel.textContent = '俯仰角:';
    pitchLabel.style.cssText = `
        font-size: 12px;
        margin: 5px 0;
        align-self: flex-start;
    `;
    pitchControlContainer.appendChild(pitchLabel);
    
    var pitchSlider = document.createElement('input');
    pitchSlider.type = 'range';
    pitchSlider.min = '0';
    pitchSlider.max = '87';  // 高德地图最大俯仰角
    pitchSlider.value = '30'; // 默认俯仰角
    pitchSlider.className = 'pitch-slider';
    pitchSlider.style.cssText = `
        width: 150px;
        margin: 5px 0;
    `;
    
    // 添加当前俯仰角显示
    var pitchValue = document.createElement('div');
    pitchValue.className = 'pitch-value';
    pitchValue.textContent = '当前俯仰角: 30°';
    pitchValue.style.cssText = `
        font-size: 12px;
        margin: 5px 0;
    `;
    
    // 添加滑块事件监听
    pitchSlider.addEventListener('input', function() {
        var pitch = parseInt(this.value);
        map.setPitch(pitch);
        pitchValue.textContent = '当前俯仰角: ' + pitch + '°';
    });
    
    // 添加旋转角度控制
    var rotationLabel = document.createElement('div');
    rotationLabel.textContent = '旋转角度:';
    rotationLabel.style.cssText = `
        font-size: 12px;
        margin: 10px 0 5px 0;
        align-self: flex-start;
    `;
    pitchControlContainer.appendChild(rotationLabel);
    
    var rotationSlider = document.createElement('input');
    rotationSlider.type = 'range';
    rotationSlider.min = '0';
    rotationSlider.max = '360';
    rotationSlider.value = '0'; // 默认旋转角度
    rotationSlider.className = 'rotation-slider';
    rotationSlider.style.cssText = `
        width: 150px;
        margin: 5px 0;
    `;
    
    // 添加当前旋转角度显示
    var rotationValue = document.createElement('div');
    rotationValue.className = 'rotation-value';
    rotationValue.textContent = '当前旋转角: 0°';
    rotationValue.style.cssText = `
        font-size: 12px;
        margin: 5px 0;
    `;
    
    // 添加旋转滑块事件监听
    rotationSlider.addEventListener('input', function() {
        var rotation = parseInt(this.value);
        map.setRotation(rotation);
        rotationValue.textContent = '当前旋转角: ' + rotation + '°';
    });
    
    // 添加预设按钮容器
    var presetContainer = document.createElement('div');
    presetContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 10px;
    `;
    
    // 添加预设角度按钮
    var presets = [
        { label: '平面', pitch: 0, rotation: 0 },
        { label: '45°', pitch: 45, rotation: 0 },
        { label: '最大', pitch: 87, rotation: 0 }
    ];
    
    presets.forEach(function(preset) {
        var button = document.createElement('button');
        button.textContent = preset.label;
        button.style.cssText = `
            padding: 5px 10px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            flex: 1;
            margin: 0 2px;
        `;
        
        button.addEventListener('click', function() {
            map.setPitch(preset.pitch);
            map.setRotation(preset.rotation);
            pitchSlider.value = preset.pitch;
            rotationSlider.value = preset.rotation;
            pitchValue.textContent = '当前俯仰角: ' + preset.pitch + '°';
            rotationValue.textContent = '当前旋转角: ' + preset.rotation + '°';
        });
        
        presetContainer.appendChild(button);
    });
    
    // 添加旋转重置按钮
    var resetRotationButton = document.createElement('button');
    resetRotationButton.textContent = '重置旋转';
    resetRotationButton.style.cssText = `
        padding: 5px 10px;
        background-color: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        width: 100%;
        margin-top: 10px;
    `;
    
    resetRotationButton.addEventListener('click', function() {
        map.setRotation(0);
        rotationSlider.value = 0;
        rotationValue.textContent = '当前旋转角: 0°';
    });
    
    // 添加切换按钮
    var toggleButton = document.createElement('div');
    toggleButton.className = 'pitch-toggle-button';
    toggleButton.innerHTML = '3D';
    toggleButton.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        background-color: #2196F3;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 101;
    `;
    
    document.getElementById('mapContainer').appendChild(toggleButton);
    
    // 将控制器添加到地图容器
    pitchControlContainer.appendChild(pitchSlider);
    pitchControlContainer.appendChild(pitchValue);
    pitchControlContainer.appendChild(rotationLabel);
    pitchControlContainer.appendChild(rotationSlider);
    pitchControlContainer.appendChild(rotationValue);
    pitchControlContainer.appendChild(presetContainer);
    pitchControlContainer.appendChild(resetRotationButton);
    document.getElementById('mapContainer').appendChild(pitchControlContainer);
    
    // 默认隐藏控制面板
    pitchControlContainer.style.display = 'none';
    
    // 切换按钮事件
    toggleButton.addEventListener('click', function() {
        isPitchControlVisible = !isPitchControlVisible;
        pitchControlContainer.style.display = isPitchControlVisible ? 'flex' : 'none';
    });
    
    // 当地图俯仰角变化时，更新滑块值
    map.on('pitch', function(e) {
        var currentPitch = map.getPitch();
        pitchSlider.value = currentPitch;
        pitchValue.textContent = '当前俯仰角: ' + currentPitch + '°';
    });
    
    // 当地图旋转角度变化时，更新滑块值
    map.on('rotate', function(e) {
        var currentRotation = map.getRotation();
        rotationSlider.value = currentRotation;
        rotationValue.textContent = '当前旋转角: ' + currentRotation + '°';
    });
}

// 添加鼠标中键控制视角功能
function addMouseWheelViewControl() {
    // 鼠标中键拖动控制视角变量
    var isMiddleMouseDown = false;
    var lastX = 0;
    var lastY = 0;
    var rotationSensitivity = 0.5; // 旋转灵敏度
    var pitchSensitivity = 0.5;    // 俯仰灵敏度
    var isMouseControlEnabled = true; // 默认启用鼠标控制
    
    // 创建鼠标控制开关按钮
    var controlButton = document.createElement('div');
    controlButton.className = 'mouse-control-button';
    controlButton.innerHTML = '鼠标控制: 开启';
    controlButton.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 150px;
        background-color: #2196F3;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    `;
    document.getElementById('mapContainer').appendChild(controlButton);
    
    // 添加按钮点击事件
    controlButton.addEventListener('click', function() {
        isMouseControlEnabled = !isMouseControlEnabled;
        controlButton.innerHTML = '鼠标控制: ' + (isMouseControlEnabled ? '开启' : '关闭');
        controlButton.style.backgroundColor = isMouseControlEnabled ? '#2196F3' : '#9E9E9E';
        
        // 显示提示信息
        if (isMouseControlEnabled) {
            showTip('鼠标中键控制已开启');
        } else {
            showTip('鼠标中键控制已关闭');
        }
    });
    
    // 创建提示信息
    var tipElement = document.createElement('div');
    tipElement.className = 'mouse-control-tip';
    tipElement.innerHTML = '按住鼠标中键并拖动：左右移动旋转地图，上下移动控制俯仰角';
    tipElement.style.cssText = `
        position: absolute;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.getElementById('mapContainer').appendChild(tipElement);
    
    // 显示提示信息函数
    function showTip(message) {
        // 如果提供了新消息，则更新提示内容
        if (message) {
            tipElement.innerHTML = message;
        }
        
        // 显示提示
        tipElement.style.opacity = '1';
        
        // 5秒后隐藏
        setTimeout(function() {
            tipElement.style.opacity = '0';
        }, 3000);
    }
    
    // 初始显示提示
    setTimeout(function() {
        showTip();
    }, 1000);
    
    // 监听鼠标中键按下事件
    document.getElementById('mapContainer').addEventListener('mousedown', function(e) {
        // 只有在启用状态下才处理鼠标中键事件
        if (!isMouseControlEnabled) return;
        
        // 鼠标中键按下 (button值为1表示中键)
        if (e.button === 1) {
            isMiddleMouseDown = true;
            lastX = e.clientX;
            lastY = e.clientY;
            
            // 阻止默认行为和冒泡
            e.preventDefault();
            e.stopPropagation();
            
            // 改变鼠标样式为抓取手势
            document.getElementById('mapContainer').style.cursor = 'grabbing';
        }
    });
    
    // 监听鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        if (isMiddleMouseDown && isMouseControlEnabled) {
            // 计算鼠标移动的距离
            var deltaX = e.clientX - lastX;
            var deltaY = e.clientY - lastY;
            
            // 获取当前地图状态
            var currentRotation = map.getRotation();
            var currentPitch = map.getPitch();
            
            // 左右移动控制地图旋转
            var newRotation = currentRotation - deltaX * rotationSensitivity;
            // 上下移动控制地图俯仰角
            var newPitch = currentPitch - deltaY * pitchSensitivity;
            
            // 限制俯仰角范围 (0-87度)
            newPitch = Math.max(0, Math.min(87, newPitch));
            
            // 应用新的旋转和俯仰角
            map.setRotation(newRotation);
            map.setPitch(newPitch);
            
            // 更新上一次鼠标位置
            lastX = e.clientX;
            lastY = e.clientY;
            
            // 阻止默认行为和冒泡
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    // 监听鼠标松开事件
    document.addEventListener('mouseup', function(e) {
        if (e.button === 1) {
            isMiddleMouseDown = false;
            // 恢复鼠标样式
            document.getElementById('mapContainer').style.cursor = 'default';
        }
    });
    
    // 监听鼠标离开地图容器事件
    document.getElementById('mapContainer').addEventListener('mouseleave', function() {
        if (isMiddleMouseDown) {
            isMiddleMouseDown = false;
            // 恢复鼠标样式
            document.getElementById('mapContainer').style.cursor = 'default';
        }
    });
    
    // 禁用浏览器默认的鼠标中键滚动行为
    document.getElementById('mapContainer').addEventListener('auxclick', function(e) {
        if (e.button === 1 && isMouseControlEnabled) {
            e.preventDefault();
            return false;
        }
    });
    
    // 监听滚轮事件，实现地图缩放功能
    document.getElementById('mapContainer').addEventListener('wheel', function(e) {
        // 如果鼠标中键正在按下，不处理滚轮事件，避免冲突
        if (isMiddleMouseDown) return;
        
        // 阻止默认行为（页面滚动）
        e.preventDefault();
        
        // 判断滚轮方向
        if (e.deltaY < 0) {
            // 向上滚动，放大地图
            map.zoomIn();
        } else {
            // 向下滚动，缩小地图
            map.zoomOut();
        }
        
        return false;
    }, { passive: false }); // passive: false 允许我们调用 preventDefault()
    
    // 移除原有的mousewheel事件监听（如果存在）
    try {
        map.off('mousewheel');
    } catch (e) {
        console.log('移除mousewheel事件监听失败，可能不存在此监听器');
    }
}

// 景点数据，新增 url 字段表示对应的网页地址
var attractions = [
    { name: '滕王阁', position: [115.881141, 28.681356], color: 'red', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '八一起义纪念馆', position: [115.889435, 28.67467], color: 'red', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%85%AB%E4%B8%80%E8%B5%B7%E4%B9%89%E7%BA%AA%E5%BF%B5%E9%A6%86/2121335' },
    { name: '秋水广场', position: [115.86273, 28.682634], color: 'red', url: 'https://baike.baidu.com/item/%E7%A7%8B%E6%B0%B4%E5%B9%BF%E5%9C%BA?fromModule=lemma_search-box' },
    { name: '南昌之星摩天轮', position: [115.850254, 28.655929], color: 'red', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E4%B9%8B%E6%98%9F%E6%91%A9%E5%A4%A9%E8%BD%AE?fromModule=lemma_search-box' },
    { name: '海昏侯国遗址博物馆', position: [115.939837, 29.030113], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E6%B1%89%E4%BB%A3%E6%B5%B7%E6%98%8F%E4%BE%AF%E5%9B%BD%E5%9B%BD%E5%AE%B6%E8%80%83%E5%8F%A4%E9%81%97%E5%9D%80%E5%85%AC%E5%9B%AD?fromtitle=%E6%B5%B7%E6%98%8F%E4%BE%AF%E5%9B%BD%E9%81%97%E5%9D%80%E5%85%AC%E5%9B%AD&fromid=19467914&fromModule=lemma_search-box' },
    { name: '万寿宫', position: [115.917573, 28.678825], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E4%B8%87%E5%AF%BF%E5%AE%AB/22186097?fromModule=lemma_sense-layer#viewPageContent' },
    { name: '绳金塔', position: [115.89989, 28.660962], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '八一广场', position: [115.904477, 28.673856], color: 'blue', url: 'https://baike.baidu.com/item/%E5%85%AB%E4%B8%80%E5%B9%BF%E5%9C%BA/15817' },
    { name: '佑民寺', position: [115.896865, 28.682202], color: 'blue', url: 'https://baike.baidu.com/item/%E4%BD%91%E6%B0%91%E5%AF%BA?fromModule=lemma_search-box' },
    { name: '新四军军部旧址', position: [115.895576, 28.667106], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '南昌动物园', position: [115.877499, 28.632283], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '象湖湿地公园', position: [115.889755, 28.624243], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '八大山人梅湖景区', position: [115.919635, 28.603473], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '梅岭', position: [115.730868, 28.769725], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '江西省博物馆', position: [115.881823, 28.7059], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '瑶湖森林公园', position: [116.038354, 28.672109], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '艾溪湖湿地森林公园', position: [115.990201, 28.689605], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '青山湖风景区', position: [115.932502, 28.702448], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '南昌.中国傩园', position: [115.822368, 28.637337], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '环球公园', position: [115.84386, 28.725369], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '江西省图书馆', position: [115.880773, 28.703922], color: 'blue', url: 'https://baike.baidu.com/item/%E6%B1%9F%E8%A5%BF%E7%9C%81%E5%9B%BE%E4%B9%A6%E9%A6%86?fromModule=lemma_search-box' },
    { name: '马兰圩湿地公园', position: [115.838774, 28.690534], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '南昌融创主题乐园', position: [115.786236, 28.577681], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '玛雅乐园', position: [115.89032, 28.632064], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '鱼尾洲公园', position: [115.994963, 28.71556], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '卢塞恩小镇', position: [115.804287, 28.590621], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '南昌舰主题园', position: [115.889225, 28.719474], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '人民公园', position: [115.914303, 28.680332], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '天香园', position: [115.956298, 28.653498], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '百花洲', position: [115.896963, 28.679208], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '朝阳江滩公园', position: [115.848169, 28.632759], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '红谷滩湿地公园', position: [115.835661, 28.637619], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '秦胖子肉陀良心店', position: [115.892861, 28.666733], color: 'green', url: 'https://map.baidu.com/search/%E7%A7%A6%E8%83%96%E5%AD%90%E8%82%89%E9%99%80%E8%89%AF%E5%BF%83%E5%BA%97/@12572059.545,3419120.31,19z?querytype=s&da_src=shareurl&wd=%E7%A7%A6%E8%83%96%E5%AD%90%E8%82%89%E9%99%80%E8%89%AF%E5%BF%83%E5%BA%97&c=131&src=0&wd2=%E5%8D%97%E6%98%8C%E5%B8%82%E8%A5%BF%E6%B9%96%E5%8C%BA&pn=0&sug=1&l=13&b=(12560560,3415576;12583644,3422664)&from=webmap&biz_forward=%7B%22scaler%22:2,%22styles%22:%22pl%22%7D&sug_forward=a6e8d669b3c24f55c8c4b7e4' }
];

// 存储当前位置
var currentPosition;

// 全局变量，用于标记是否处于自选位置模式
var isCustomLocationMode = false;
var navigationControlVisible = true;
var navigationCompleted = false;

// 登录验证
function login() {
    var username = document.getElementById('username').value || 'admin';
    var password = document.getElementById('password').value || '123456';
    if (username === 'admin' && password === '123456') {
        document.getElementById('loginModal').style.display = 'none';
        initMap();
    } else {
        alert('用户名或密码错误，请重试');
    }
}

// 初始化地图和其他功能
function initMap() {
    // 添加景点标记
    attractions.forEach(function (attraction) {
        var marker = new AMap.Marker({
            position: attraction.position,
            title: attraction.name,
            content: '<div class="custom-marker" style="background-color: ' + attraction.color + ';">' + attraction.name + '</div>'
        });
        marker.setMap(map);

        // 为标记添加点击事件监听器
        marker.on('click', function () {
            if (attraction.url) {
                window.open(attraction.url, '_blank');
            }
        });
    });

    // 添加3D控制控件
    try {
        var controlBar = new AMap.ControlBar({
            position: {
                right: '10px',
                top: '110px'
            },
            showZoomBar: true,
            showControlButton: true,
            showMapTypeSelect: false
        });
        map.addControl(controlBar);
    } catch (error) {
        console.error("加载3D控制控件失败:", error);
        // 继续执行，不影响其他功能
    }
    
    // 添加比例尺控件
    try {
        var scale = new AMap.Scale();
        map.addControl(scale);
    } catch (error) {
        console.error("加载比例尺控件失败:", error);
    }
    
    // 添加指南针控件
    try {
        var toolBar = new AMap.ToolBar({
            position: {
                right: '40px',
                top: '110px'
            }
        });
        map.addControl(toolBar);
    } catch (error) {
        console.error("加载指南针控件失败:", error);
    }

    // 添加搜索框面板切换按钮
    addSearchBoxToggleButton();

    // 添加3D视角俯仰角控制器
    add3DPitchControl();
    
    // 添加鼠标中键控制视角功能
    addMouseWheelViewControl();

    // 搜索功能
    document.getElementById('searchInput').addEventListener('click', function () {
        var dropdown = document.getElementById('dropdownList');
        dropdown.innerHTML = '';
        attractions.forEach(function (attraction) {
            var li = document.createElement('li');
            li.textContent = attraction.name;
            li.addEventListener('click', function () {
                document.getElementById('searchInput').value = attraction.name;
                dropdown.style.display = 'none';

                // 定位到选中的景点
                map.setCenter(attraction.position);
                map.setZoom(15);
                
                // 添加目的地标记
                if (destinationMarker) {
                    map.remove(destinationMarker);
                }
                destinationMarker = new AMap.Marker({
                    position: attraction.position,
                    icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
                    offset: new AMap.Pixel(-13, -30)
                });
                map.add(destinationMarker);
            });
            dropdown.appendChild(li);
        });
        dropdown.style.display = 'block';
    });

    // 点击其他区域关闭下拉列表
    document.addEventListener('click', function (event) {
        var searchBox = document.querySelector('.search-box');
        var dropdown = document.getElementById('dropdownList');
        if (!searchBox.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    // 定位到当前位置
    document.getElementById('locateButton').addEventListener('click', function () {
        // 使用高德地图的定位插件
        AMap.plugin('AMap.Geolocation', function () {
            var geolocation = new AMap.Geolocation({
                enableHighAccuracy: true, // 是否使用高精度定位，默认:true
                timeout: 10000,           // 超过10秒后停止定位，默认：5s
                buttonPosition: 'RB',     // 定位按钮的位置
                buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量
                zoomToAccuracy: true,     // 定位成功后是否自动调整地图视野到定位点
                showMarker: false         // 定位成功后在定位到的位置显示点标记
            });
            
            map.addControl(geolocation);
            
            geolocation.getCurrentPosition(function(status, result) {
                if (status === 'complete') {
                    // 定位成功
                    currentPosition = result.position;
                    
                    // 在地图上标记当前位置
                    if (navigationMarker) {
                        map.remove(navigationMarker);
                    }
                    
                    navigationMarker = new AMap.Marker({
                        position: currentPosition,
                        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                        offset: new AMap.Pixel(-13, -30)
                    });
                    
                    map.add(navigationMarker);
                    map.setCenter(currentPosition);
                    map.setZoom(15);
                    
                    console.log('定位成功:', result);
                    alert('定位成功！');
                } else {
                    // 定位失败
                    console.error('定位失败:', result);
                    alert('定位失败：' + result.message);
                    
                    // 如果浏览器定位失败，可以尝试使用IP定位作为备选
                    fallbackToIPLocation();
                }
            });
        });
    });

    // IP定位作为备选方案
    function fallbackToIPLocation() {
        AMap.plugin('AMap.CitySearch', function () {
            var citySearch = new AMap.CitySearch();
            citySearch.getLocalCity(function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    // 查询成功，result为当前所在城市信息
                    var center = result.rectangle.split(';');
                    var centerLngLat = new AMap.LngLat(
                        (parseFloat(center[0].split(',')[0]) + parseFloat(center[1].split(',')[0])) / 2,
                        (parseFloat(center[0].split(',')[1]) + parseFloat(center[1].split(',')[1])) / 2
                    );
                    
                    // 使用城市中心点作为当前位置
                    currentPosition = centerLngLat;
                    map.setCenter(centerLngLat);
                    
                    alert('无法获取精确位置，已定位到城市中心: ' + result.city);
                } else {
                    alert('定位失败，请手动选择景点');
                }
            });
        });
    }

    // 自选位置功能
    document.getElementById('customLocationButton').addEventListener('click', function() {
        // 设置为自选位置模式
        isCustomLocationMode = true;
        
        // 提示用户点击地图选择位置
        alert('请点击地图上的任意位置作为您的位置');
        
        // 改变鼠标样式，提示用户可以点击地图
        map.setDefaultCursor('crosshair');
        
        // 5秒后如果用户没有点击，则自动取消自选位置模式
        setTimeout(function() {
            if (isCustomLocationMode) {
                isCustomLocationMode = false;
                map.setDefaultCursor('default');
                alert('自选位置已超时，请重新点击"自选位置"按钮');
            }
        }, 10000);
    });
    
    // 清除自选位置功能
    document.getElementById('clearCustomLocationButton').addEventListener('click', function() {
        // 取消自选位置模式
        isCustomLocationMode = false;
        map.setDefaultCursor('default');
        
        if (customLocationMarker) {
            map.remove(customLocationMarker);
            customLocationMarker = null;
            
            // 清除当前位置
            currentPosition = null;
            alert('已清除自选位置');
        } else {
            alert('没有自选位置需要清除');
        }
    });

    // 导航功能
    document.getElementById('navigateButton').addEventListener('click', function () {
        if (!currentPosition) {
            alert('请先定位到您的位置或选择一个自定义位置');
            return;
        }

        var selectedAttractionName = document.getElementById('searchInput').value;
        var selectedAttraction = attractions.find(function (attraction) {
            return attraction.name === selectedAttractionName;
        });

        if (!selectedAttraction) {
            alert('请先选择一个景点');
            return;
        }

        // 如果已经在导航中，先清除之前的导航
        if (isNavigating) {
            clearNavigation();
        }

        // 创建导航面板容器（如果不存在）
        var navigationPanel = document.getElementById('navigationPanel');
        if (!navigationPanel) {
            navigationPanel = document.createElement('div');
            navigationPanel.id = 'navigationPanel';
            navigationPanel.className = 'navigation-panel';
            document.body.appendChild(navigationPanel);
            
            // 添加关闭按钮
            var closeButton = document.createElement('button');
            closeButton.textContent = '关闭导航';
            closeButton.className = 'close-navigation-btn';
            closeButton.onclick = clearNavigation;
            navigationPanel.appendChild(closeButton);
        } else {
            // 清空现有内容
            navigationPanel.innerHTML = '';
            
            // 重新添加关闭按钮
            var closeButton = document.createElement('button');
            closeButton.textContent = '关闭导航';
            closeButton.className = 'close-navigation-btn';
            closeButton.onclick = clearNavigation;
            navigationPanel.appendChild(closeButton);
            
            // 确保面板不是最小化状态
            navigationPanel.classList.remove('minimized');
            navigationPanel.style.height = 'auto';
        }
        
        // 显示导航面板
        navigationPanel.style.display = 'block';
        
        // 设置起点和终点
        var startPoint = [currentPosition.lng, currentPosition.lat];
        var endPoint = selectedAttraction.position;
        
        console.log("开始导航计算，起点:", startPoint, "终点:", endPoint);
        
        // 显示一个加载中的提示
        var loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingInfo';
        loadingDiv.textContent = '正在计算路线，请稍候...';
        navigationPanel.appendChild(loadingDiv);
        
        try {
            // 获取选中的导航方式
            var navMode = document.querySelector('input[name="navMode"]:checked').value;
            var navModeName = '';
            
            // 根据不同的导航方式调用不同的导航插件
            if (navMode === 'driving') {
                navModeName = '驾车';
                // 驾车导航
                AMap.plugin(['AMap.Driving'], function() {
                    // 创建一个临时容器用于驾车路线展示
                    var tempPanelId = 'tempDrivingPanel';
                    var tempPanel = document.createElement('div');
                    tempPanel.id = tempPanelId;
                    navigationPanel.appendChild(tempPanel);
                    
                    // 每次创建新的驾车实例，避免复用可能导致的问题
                    driving = new AMap.Driving({
                        map: map,
                        panel: tempPanelId,
                        hideMarkers: false,  // 显示起终点标记
                        autoFitView: true    // 自动调整地图视野
                    });
                    
                    // 构造起终点
                    var startLngLat = new AMap.LngLat(startPoint[0], startPoint[1]);
                    var endLngLat = new AMap.LngLat(endPoint[0], endPoint[1]);
                    
                    // 计算驾车路线
                    driving.search(
                        startLngLat, 
                        endLngLat, 
                        { waypoints: [] },  // 途经点，这里设为空
                        function(status, result) {
                            handleNavigationResult(status, result, navModeName);
                        }
                    );
                });
            } else if (navMode === 'riding') {
                navModeName = '骑行';
                // 骑行导航
                AMap.plugin(['AMap.Riding'], function() {
                    // 创建一个临时容器用于骑行路线展示
                    var tempPanelId = 'tempRidingPanel';
                    var tempPanel = document.createElement('div');
                    tempPanel.id = tempPanelId;
                    navigationPanel.appendChild(tempPanel);
                    
                    riding = new AMap.Riding({
                        map: map,
                        panel: tempPanelId,
                        hideMarkers: false,
                        autoFitView: true
                    });
                    
                    var startLngLat = new AMap.LngLat(startPoint[0], startPoint[1]);
                    var endLngLat = new AMap.LngLat(endPoint[0], endPoint[1]);
                    
                    riding.search(
                        startLngLat,
                        endLngLat,
                        function(status, result) {
                            handleNavigationResult(status, result, navModeName);
                        }
                    );
                });
            } else if (navMode === 'walking') {
                navModeName = '步行';
                // 步行导航
                AMap.plugin(['AMap.Walking'], function() {
                    // 创建一个临时容器用于步行路线展示
                    var tempPanelId = 'tempWalkingPanel';
                    var tempPanel = document.createElement('div');
                    tempPanel.id = tempPanelId;
                    navigationPanel.appendChild(tempPanel);
                    
                    walking = new AMap.Walking({
                        map: map,
                        panel: tempPanelId,
                        hideMarkers: false,
                        autoFitView: true
                    });
                    
                    var startLngLat = new AMap.LngLat(startPoint[0], startPoint[1]);
                    var endLngLat = new AMap.LngLat(endPoint[0], endPoint[1]);
                    
                    walking.search(
                        startLngLat,
                        endLngLat,
                        function(status, result) {
                            handleNavigationResult(status, result, navModeName);
                        }
                    );
                });
            }
        } catch (error) {
            console.error("导航计算过程中发生错误:", error);
            alert("导航计算过程中发生错误: " + error.message);
        }
    });

    // 处理导航结果
    function handleNavigationResult(status, result, mode) {
        // 移除加载提示
        var loadingInfo = document.getElementById('loadingInfo');
        if (loadingInfo) {
            loadingInfo.remove();
        }
        
        console.log("导航计算结果状态:", status);
        console.log("导航计算结果:", result);
        
        if (status === 'complete') {
            isNavigating = true;
            console.log(mode + '导航路线计算成功');
            
            // 检查routes是否存在
            if (!result.routes || result.routes.length === 0) {
                alert('未能找到有效的导航路线');
                return;
            }
            
            // 确保导航面板中有关闭按钮（针对骑行导航可能覆盖按钮的问题）
            var navigationPanel = document.getElementById('navigationPanel');
            if (navigationPanel && !navigationPanel.querySelector('.close-navigation-btn')) {
                var closeButton = document.createElement('button');
                closeButton.textContent = '关闭导航';
                closeButton.className = 'close-navigation-btn';
                closeButton.onclick = clearNavigation;
                navigationPanel.insertBefore(closeButton, navigationPanel.firstChild);
            }
            
            // 创建导航标记（用于实时位置显示）
            if (navigationMarker) {
                map.remove(navigationMarker);
            }
            
            navigationMarker = new AMap.Marker({
                map: map,
                position: [currentPosition.lng, currentPosition.lat],
                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                offset: new AMap.Pixel(-13, -30)
            });
            
            // 模拟导航过程
            simulateNavigation(result.routes[0], mode);
        } else {
            // 处理错误信息为undefined的情况
            var errorMsg = result && result.info ? result.info : '未知错误';
            console.error('导航路线计算失败:', errorMsg);
            alert('导航路线计算失败，错误信息：' + errorMsg + '\n请检查起点和终点坐标是否有效');
            
            // 尝试使用直线连接起终点作为备选方案
            var startLngLat = new AMap.LngLat(currentPosition.lng, currentPosition.lat);
            var endLngLat;
            
            // 获取选中的景点位置
            var selectedAttractionName = document.getElementById('searchInput').value;
            var selectedAttraction = attractions.find(function (attraction) {
                return attraction.name === selectedAttractionName;
            });
            
            if (selectedAttraction) {
                endLngLat = new AMap.LngLat(selectedAttraction.position[0], selectedAttraction.position[1]);
                createDirectPath(startLngLat, endLngLat);
            }
        }
    }

    // 创建直线路径作为备选方案
    function createDirectPath(start, end) {
        if (confirm('是否使用直线路径作为备选导航方案？')) {
            if (navigationPath) {
                map.remove(navigationPath);
            }
            
            navigationPath = new AMap.Polyline({
                path: [start, end],
                strokeColor: "#3366FF",
                strokeWeight: 6,
                strokeOpacity: 0.8,
                zIndex: 100
            });
            
            map.add(navigationPath);
            map.setFitView([navigationPath]);
            
            // 计算直线距离
            var distance = AMap.GeometryUtil.distance(start, end);
            var distanceText = distance < 1000 ? 
                distance.toFixed(2) + ' 米' : 
                (distance / 1000).toFixed(2) + ' 千米';
            
            alert('已创建直线路径，距离约为: ' + distanceText);
        }
    }

    // 地图类型切换功能
    document.querySelectorAll('input[name="mapType"]').forEach(function (input) {
        input.addEventListener('change', function () {
            try {
                // 获取当前视图模式
                var currentViewMode = map.getStatus().viewMode;
                console.log('当前视图模式:', currentViewMode);
                
                // 检查路况图层是否已添加
                var isTrafficLayerAdded = false;
                map.getLayers().forEach(function(layer) {
                    if (layer === trafficLayer) {
                        isTrafficLayerAdded = true;
                    }
                });
                
                // 检查建筑物图层是否已添加
                var isBuildingsAdded = false;
                map.getLayers().forEach(function(layer) {
                    if (layer === buildings) {
                        isBuildingsAdded = true;
                    }
                });
                
                if (this.value === 'normal') {
                    // 切换到普通地图
                    map.setLayers([new AMap.TileLayer()]);
                    
                    // 仅在3D视角下添加建筑物图层
                    if (currentViewMode === '3D') {
                        console.log('在普通地图模式下添加3D建筑物图层');
                        // 确保建筑物图层被正确添加
                        try {
                            map.add(buildings);    // 使用add方法而不是setMap
                        } catch (e) {
                            console.error('添加建筑物图层出错:', e);
                        }
                    }
                    
                    // 如果之前有路况图层，重新添加
                    if (isTrafficLayerAdded || document.getElementById('trafficMap').checked) {
                        map.add(trafficLayer);
                    }
                } else if (this.value === 'satellite') {
                    // 切换到卫星图，不显示3D建筑物
                    map.setLayers([new AMap.TileLayer.Satellite()]);
                    
                    // 如果建筑物图层已添加，移除它
                    if (isBuildingsAdded) {
                        map.remove(buildings);
                    }
                    
                    // 如果之前有路况图层，重新添加
                    if (isTrafficLayerAdded || document.getElementById('trafficMap').checked) {
                        map.add(trafficLayer);
                    }
                } else if (this.value === 'traffic') {
                    // 添加路况图层
                    if (!isTrafficLayerAdded) {
                        map.add(trafficLayer);
                    }
                    document.getElementById('trafficMap').checked = true;
                } else {
                    // 移除路况图层
                    if (isTrafficLayerAdded) {
                        map.remove(trafficLayer);
                    }
                    document.getElementById('trafficMap').checked = false;
                }
            } catch (error) {
                console.error("切换地图类型失败:", error);
            }
        });
    });

    // 2D/3D视图切换功能
    document.querySelectorAll('input[name="viewMode"]').forEach(function (input) {
        input.addEventListener('change', function () {
            try {
                if (this.value === '2D') {
                    // 使用setStatus方法代替setViewMode
                    map.setStatus({
                        viewMode: '2D'
                    });
                    map.setPitch(0);  // 平面视角
                    map.setRotation(0); // 重置旋转
                    
                    // 2D模式下移除建筑物图层
                    // 先检查建筑物图层是否存在于地图中
                    var hasBuildings = false;
                    map.getLayers().forEach(function(layer) {
                        if (layer === buildings) {
                            hasBuildings = true;
                        }
                    });
                    
                    if (hasBuildings) {
                        console.log('2D模式：移除建筑物图层');
                        map.remove(buildings);
                    }
                } else if (this.value === '3D') {
                    // 使用setStatus方法代替setViewMode
                    map.setStatus({
                        viewMode: '3D'
                    });
                    map.setPitch(30); // 设置俯仰角
                    
                    // 仅在普通地图模式下添加建筑物图层
                    var mapTypeElements = document.querySelectorAll('input[name="mapType"]');
                    for (var i = 0; i < mapTypeElements.length; i++) {
                        if (mapTypeElements[i].checked && mapTypeElements[i].value === 'normal') {
                            console.log('3D模式+普通地图：添加建筑物图层');
                            try {
                                // 先检查建筑物图层是否存在于地图中
                                var hasBuildings = false;
                                map.getLayers().forEach(function(layer) {
                                    if (layer === buildings) {
                                        hasBuildings = true;
                                    }
                                });
                                
                                if (hasBuildings) {
                                    map.remove(buildings); // 先移除，避免重复添加
                                }
                                map.add(buildings);    // 使用add方法而不是setMap
                            } catch (e) {
                                console.error('添加建筑物图层出错:', e);
                            }
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error("切换视图模式失败:", error);
                alert("切换视图模式失败，请尝试刷新页面");
            }
        });
    });

    // 创建导航控制面板
    createNavigationControl();
}

// 显示登录模态框
window.onload = function () {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('loginButton').addEventListener('click', login);
    
    // 自动登录（开发测试用）
    login();
    
    // 添加地图点击事件监听器
    map.on('click', function(e) {
        // 只有在自选位置模式下才处理点击事件
        if (isCustomLocationMode) {
            handleCustomLocationClick(e);
            // 处理完一次点击后关闭自选位置模式
            isCustomLocationMode = false;
        }
    });
};

// 处理自选位置点击
function handleCustomLocationClick(e) {
    // 获取点击位置的坐标
    var clickPosition = e.lnglat;
    console.log('自选位置坐标:', clickPosition);
    
    // 设置当前位置
    currentPosition = {
        lng: clickPosition.getLng(),
        lat: clickPosition.getLat()
    };
    
    // 清除之前的位置标记
    if (navigationMarker) {
        map.remove(navigationMarker);
        navigationMarker = null;
    }
    if (customLocationMarker) {
        map.remove(customLocationMarker);
    }
    
    // 添加新的位置标记（使用红色图标）
    customLocationMarker = new AMap.Marker({
        position: clickPosition,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
        offset: new AMap.Pixel(-13, -30)
    });
    map.add(customLocationMarker);
    
    // 重置鼠标样式
    map.setDefaultCursor('default');
    
    // 使用逆地理编码获取位置信息
    var geocoder = new AMap.Geocoder();
    geocoder.getAddress(clickPosition, function(status, result) {
        if (status === 'complete' && result.info === 'OK') {
            var address = result.regeocode.formattedAddress;
            alert('您选择的位置是：' + address);
        } else {
            alert('您已选择一个位置，但无法获取详细地址');
        }
    });
}

// 长度量算功能
var measureButton = document.getElementById('measureButton');
var isMeasuring = false;
var startPoint = null;
var distanceLine = null;
var distanceLabel = null;

measureButton.addEventListener('click', function () {
    isMeasuring = !isMeasuring;

    if (isMeasuring) {
        measureButton.textContent = '取消量算';
        measureButton.style.backgroundColor = 'red';
        map.setDefaultCursor('crosshair');
        alert('请在地图上点击起点和终点进行距离量算');
    } else {
        measureButton.textContent = '长度量算';
        measureButton.style.backgroundColor = '';
        map.setDefaultCursor('default');

        // 清除量算标记
        if (distanceLine) {
            map.remove(distanceLine);
            distanceLine = null;
        }

        if (distanceLabel) {
            map.remove(distanceLabel);
            distanceLabel = null;
        }

        startPoint = null;
    }
});

// 地图点击事件
map.on('click', function (e) {
    if (!isMeasuring) return;

    var point = e.lnglat;

    if (!startPoint) {
        // 第一个点
        startPoint = point;

        // 添加起点标记
        var startMarker = new AMap.Marker({
            position: startPoint,
            icon: new AMap.Icon({
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
                size: new AMap.Size(25, 34)
            }),
            map: map
        });

        // 临时存储起点标记，以便后续清除
        if (!window.measureMarkers) window.measureMarkers = [];
        window.measureMarkers.push(startMarker);
    } else {
        // 第二个点，计算距离
        var endPoint = point;

        // 添加终点标记
        var endMarker = new AMap.Marker({
            position: endPoint,
            icon: new AMap.Icon({
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                size: new AMap.Size(25, 34)
            }),
            map: map
        });

        window.measureMarkers.push(endMarker);

        // 计算距离（米）
        var distance = AMap.GeometryUtil.distance(startPoint, endPoint);

        // 绘制线段
        if (distanceLine) {
            map.remove(distanceLine);
        }

        distanceLine = new AMap.Polyline({
            path: [startPoint, endPoint],
            strokeColor: "#FF33FF",
            strokeWeight: 2,
            strokeOpacity: 1,
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50
        });

        map.add(distanceLine);

        // 显示距离信息
        if (distanceLabel) {
            map.remove(distanceLabel);
        }

        // 格式化距离显示（小于1000米显示米，大于等于1000米显示千米）
        var distanceText = distance < 1000 ?
            distance.toFixed(2) + ' 米' :
            (distance / 1000).toFixed(2) + ' 千米';

        // 计算线段中点位置
        var midPoint = [
            (startPoint.getLng() + endPoint.getLng()) / 2,
            (startPoint.getLat() + endPoint.getLat()) / 2
        ];

        distanceLabel = new AMap.Marker({
            position: midPoint,
            offset: new AMap.Pixel(-25, -30),
            content: '<div style="background-color:white;padding:2px 5px;border-radius:3px;' +
                'border:1px solid #ccc;font-size:12px;">' + distanceText + '</div>',
            anchor: 'bottom-center',
            zIndex: 100
        });

        map.add(distanceLabel);

        // 提示用户继续量算或取消
        alert('量算完成！距离为：' + distanceText +
            '\n可继续点击地图进行新的量算，或点击"取消量算"按钮结束');

        // 重置起点，允许继续量算
        startPoint = endPoint;
    }
});

// 清除量算标记功能
var clearMeasureButton = document.getElementById('clearMeasureButton');

clearMeasureButton.addEventListener('click', function () {
    // 清除存储的量算标记
    if (window.measureMarkers) {
        window.measureMarkers.forEach(function (marker) {
            marker.setMap(null); // 从地图上移除标记
        });
        window.measureMarkers = []; // 清空标记数组
    }

    // 清除距离线段
    if (distanceLine) {
        map.remove(distanceLine);
        distanceLine = null;
    }

    // 清除距离标签
    if (distanceLabel) {
        map.remove(distanceLabel);
        distanceLabel = null;
    }

    // 重置起点
    startPoint = null;
});
// 新增变量
var rectangleAreaButton = document.getElementById('rectangleAreaButton');
var isRectangleAreaMeasuring = false;
var rectanglePoints = [];
var rectanglePolygon = null;
var rectangleAreaLabel = null;

// 新增按钮点击事件监听器
rectangleAreaButton.addEventListener('click', function () {
    isRectangleAreaMeasuring = !isRectangleAreaMeasuring;

    if (isRectangleAreaMeasuring) {
        rectangleAreaButton.textContent = '取消矩形面积量算';
        rectangleAreaButton.style.backgroundColor = 'red';
        map.setDefaultCursor('crosshair');
        rectanglePoints = [];
        alert('请在地图上依次点击两个点来确定矩形的对角顶点');
    } else {
        rectangleAreaButton.textContent = '矩形面积计算';
        rectangleAreaButton.style.backgroundColor = '';
        map.setDefaultCursor('default');
        clearRectangleAreaMeasure();
    }
});

// 地图点击事件处理矩形面积量算
map.on('click', function (e) {
    if (!isRectangleAreaMeasuring) return;

    var point = e.lnglat;
    rectanglePoints.push(point);

    if (rectanglePoints.length === 2) {
        // 计算矩形的四个顶点
        var x1 = rectanglePoints[0].getLng();
        var y1 = rectanglePoints[0].getLat();
        var x2 = rectanglePoints[1].getLng();
        var y2 = rectanglePoints[1].getLat();

        var path = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2],
            [x1, y1]
        ];

        // 绘制矩形
        if (rectanglePolygon) map.remove(rectanglePolygon);
        rectanglePolygon = new AMap.Polygon({
            path: path,
            strokeColor: "#FF33FF",
            strokeWeight: 2,
            strokeOpacity: 1,
            fillColor: "#FF99FF",
            fillOpacity: 0.3,
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50
        });
        map.add(rectanglePolygon);

        // 计算矩形的长和宽
        var length = AMap.GeometryUtil.distance(rectanglePoints[0], new AMap.LngLat(x2, y1));
        var width = AMap.GeometryUtil.distance(rectanglePoints[0], new AMap.LngLat(x1, y2));

        // 计算面积
        var area = length * width;

        // 显示面积信息
        if (rectangleAreaLabel) map.remove(rectangleAreaLabel);
        var areaText = area < 1000000 ?
            area.toFixed(2) + ' 平方米' :
            (area / 1000000).toFixed(2) + ' 平方千米';

        var center = rectanglePolygon.getBounds().getCenter();

        rectangleAreaLabel = new AMap.Marker({
            position: center,
            offset: new AMap.Pixel(-25, -30),
            content: `<div style="background-color:white;padding:2px 5px;border-radius:3px;
                border:1px solid #ccc;font-size:12px;">${areaText}</div>`,
            anchor: 'bottom-center',
            zIndex: 100
        });

        map.add(rectangleAreaLabel);
        alert(`矩形面积量算完成！面积为：${areaText}`);

        // 重置状态
        rectanglePoints = [];
    }
});

// 清除矩形面积量算标记
function clearRectangleAreaMeasure() {
    if (rectanglePolygon) {
        map.remove(rectanglePolygon);
        rectanglePolygon = null;
    }

    if (rectangleAreaLabel) {
        map.remove(rectangleAreaLabel);
        rectangleAreaLabel = null;
    }

    rectanglePoints = [];
}
// 新增变量
var circleAreaButton = document.getElementById('circleAreaButton');
var isCircleAreaMeasuring = false;
var circleCenter = null;
var circleRadius = null;
var circle = null;
var circleAreaLabel = null;

// 新增按钮点击事件监听器
circleAreaButton.addEventListener('click', function () {
    isCircleAreaMeasuring = !isCircleAreaMeasuring;

    if (isCircleAreaMeasuring) {
        circleAreaButton.textContent = '取消圆面积量算';
        circleAreaButton.style.backgroundColor = 'red';
        map.setDefaultCursor('crosshair');
        circleCenter = null;
        circleRadius = null;
        alert('请在地图上依次点击圆心和圆上一点来确定圆');
    } else {
        circleAreaButton.textContent = '圆面积计算';
        circleAreaButton.style.backgroundColor = '';
        map.setDefaultCursor('default');
        clearCircleAreaMeasure();
    }
});

// 地图点击事件处理圆面积量算
map.on('click', function (e) {
    if (!isCircleAreaMeasuring) return;

    var point = e.lnglat;

    if (!circleCenter) {
        // 第一个点，确定圆心
        circleCenter = point;

        // 添加圆心标记
        var centerMarker = new AMap.Marker({
            position: circleCenter,
            icon: new AMap.Icon({
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
                size: new AMap.Size(25, 34)
            }),
            map: map
        });

        // 临时存储圆心标记，以便后续清除
        if (!window.circleMarkers) window.circleMarkers = [];
        window.circleMarkers.push(centerMarker);
    } else {
        // 第二个点，确定半径
        circleRadius = AMap.GeometryUtil.distance(circleCenter, point);

        // 添加圆上点标记
        var radiusMarker = new AMap.Marker({
            position: point,
            icon: new AMap.Icon({
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                size: new AMap.Size(25, 34)
            }),
            map: map
        });

        window.circleMarkers.push(radiusMarker);

        // 绘制圆
        if (circle) map.remove(circle);
        circle = new AMap.Circle({
            center: circleCenter,
            radius: circleRadius,
            strokeColor: "#FF33FF",
            strokeWeight: 2,
            strokeOpacity: 1,
            fillColor: "#FF99FF",
            fillOpacity: 0.3,
            zIndex: 50
        });
        map.add(circle);

        // 计算圆面积
        var area = Math.PI * circleRadius * circleRadius;

        // 显示面积信息
        if (circleAreaLabel) map.remove(circleAreaLabel);
        var areaText = area < 1000000 ?
            area.toFixed(2) + ' 平方米' :
            (area / 1000000).toFixed(2) + ' 平方千米';

        var center = circle.getBounds().getCenter();

        circleAreaLabel = new AMap.Marker({
            position: center,
            offset: new AMap.Pixel(-25, -30),
            content: `<div style="background-color:white;padding:2px 5px;border-radius:3px;
                border:1px solid #ccc;font-size:12px;">${areaText}</div>`,
            anchor: 'bottom-center',
            zIndex: 100
        });

        map.add(circleAreaLabel);
        alert(`圆面积量算完成！面积为：${areaText}`);

        // 重置状态
        circleCenter = null;
        circleRadius = null;
    }
});

// 清除圆面积量算标记
function clearCircleAreaMeasure() {
    if (circle) {
        map.remove(circle);
        circle = null;
    }

    if (circleAreaLabel) {
        map.remove(circleAreaLabel);
        circleAreaLabel = null;
    }

    if (window.circleMarkers) {
        window.circleMarkers.forEach(function (marker) {
            marker.setMap(null);
        });
        window.circleMarkers = [];
    }

    circleCenter = null;
    circleRadius = null;
}
// 创建鹰眼图容器
const overviewContainer = document.createElement('div');
overviewContainer.id = 'overviewMap';
overviewContainer.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 200px;
    height: 200px;
    border: 2px solid #ccc;
    border-radius: 4px;
    background: white;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
`;
document.body.appendChild(overviewContainer);

// 创建鹰眼图开关按钮
const toggleBtn = document.createElement('button');
toggleBtn.id = 'toggleOverview';
toggleBtn.textContent = '⊕'; // 初始为显示状态
toggleBtn.style.cssText = `
    position: absolute;
    bottom: 224px;
    right: 20px;
    width: 30px;
    height: 30px;
    border: none;
    background: #fff;
    color: #333;
    border-radius: 4px 4px 0 0;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.15);
    cursor: pointer;
    z-index: 1001;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
`;
document.body.appendChild(toggleBtn);

// 初始化鹰眼图
const overviewMap = new AMap.Map('overviewMap', {
    zoom: 8,
    center: [115.892111, 28.676493],
    viewMode: '2D',
    resizeEnable: true,
    layers: [new AMap.TileLayer()],
    zooms: [8, 10],
    controls: []
});

// 定义南昌市边界
const nanchangBounds = new AMap.Bounds(
    [115.3, 28.1],
    [116.4, 29.2]
);
overviewMap.setBounds(nanchangBounds);

// 创建视口矩形
let viewportRect;
function updateViewportRect() {
    const bounds = map.getBounds();
    if (viewportRect) {
        viewportRect.setBounds(bounds);
    } else {
        viewportRect = new AMap.Rectangle({
            bounds: bounds,
            strokeColor: "#FF33FF",
            strokeWeight: 2,
            strokeOpacity: 1,
            fillOpacity: 0.1,
            fillColor: "#FF99CC",
            zIndex: 50
        });
        overviewMap.add(viewportRect);
    }
}

// 监听主地图变化
map.on('moveend', updateViewportRect);
map.on('zoomend', updateViewportRect);

// 点击鹰眼图，主地图移动到对应位置
overviewMap.on('click', function(e) {
    map.setCenter(e.lnglat);
});

// 初始更新视口矩形
updateViewportRect();

// 切换鹰眼图显示/隐藏
let isOverviewVisible = true;

// 从本地存储读取上次状态
if (localStorage.getItem('overviewVisible') === 'false') {
    toggleOverview();
}

function toggleOverview() {
    isOverviewVisible = !isOverviewVisible;
    localStorage.setItem('overviewVisible', isOverviewVisible);
    
    if (isOverviewVisible) {
        overviewContainer.style.display = 'block';
        toggleBtn.textContent = '⊖';
        toggleBtn.style.bottom = '224px';
    } else {
        overviewContainer.style.display = 'none';
        toggleBtn.textContent = '⊕';
        toggleBtn.style.bottom = '20px';
    }
}

toggleBtn.addEventListener('click', toggleOverview);

// 清除导航
function clearNavigation() {
    try {
        isNavigating = false;
        navigationCompleted = false;
        
        // 隐藏导航面板
        var navigationPanel = document.getElementById('navigationPanel');
        if (navigationPanel) {
            navigationPanel.style.display = 'none';
        }
        
        // 清除导航标记和路径
        if (navigationMarker) {
            try {
                map.remove(navigationMarker);
            } catch (error) {
                console.error("移除导航标记失败:", error);
            }
            navigationMarker = null;
        }
        
        if (navigationPath) {
            try {
                map.remove(navigationPath);
            } catch (error) {
                console.error("移除导航路径失败:", error);
            }
            navigationPath = null;
        }
        
        // 清除交通状况路段
        if (window.trafficSegments && window.trafficSegments.length > 0) {
            window.trafficSegments.forEach(function(segment) {
                if (segment) {
                    try {
                        map.remove(segment);
                    } catch (error) {
                        console.error("移除交通状况路段失败:", error);
                    }
                }
            });
            window.trafficSegments = [];
        }
        
        if (navigationInfoWindow) {
            try {
                navigationInfoWindow.close();
            } catch (error) {
                console.error("关闭导航信息窗口失败:", error);
            }
            navigationInfoWindow = null;
        }
        
        // 清除目的地标记
        if (destinationMarker) {
            try {
                map.remove(destinationMarker);
            } catch (error) {
                console.error("移除目的地标记失败:", error);
            }
            destinationMarker = null;
        }
        
        // 清除模拟导航的定时器
        if (window.navigationTimer) {
            clearInterval(window.navigationTimer);
            window.navigationTimer = null;
        }
        
        // 移除可能存在的导航完成对话框
        var arrivalDialog = document.getElementById('arrivalDialog');
        if (arrivalDialog && arrivalDialog.parentNode) {
            try {
                arrivalDialog.parentNode.removeChild(arrivalDialog);
            } catch (error) {
                console.error("移除导航完成对话框失败:", error);
            }
        }
        
        console.log("导航已清除");
    } catch (error) {
        console.error("清除导航时发生错误:", error);
    }
}

// 定义导航颜色
var navigationColors = {
    driving: '#3366FF',  // 蓝色
    riding: '#FF6600',   // 橙色
    walking: '#33CC33'   // 绿色
};

// 模拟导航过程
function simulateNavigation(route, mode) {
    console.log("开始模拟" + mode + "导航，路线数据:", route);
    
    // 检查路径数据
    var path = [];
    var steps = [];
    
    // 如果路径不存在，则从steps或rides中构建路径
    if (!route.path || route.path.length === 0) {
        console.log("路径不存在，从导航数据构建路径");
        
        // 骑行导航使用rides，驾车和步行使用steps
        if (mode === '骑行' && route.rides && route.rides.length > 0) {
            steps = route.rides;
            console.log("使用骑行路线数据，步骤数:", steps.length);
            
            // 构建路径
            steps.forEach(function(ride) {
                if (ride.path && ride.path.length > 0) {
                    path = path.concat(ride.path);
                } else if (ride.start_location && ride.end_location) {
                    path.push([ride.start_location.lng, ride.start_location.lat]);
                    path.push([ride.end_location.lng, ride.end_location.lat]);
                }
            });
        } 
        // 步行导航使用steps
        else if (mode === '步行' && route.steps && route.steps.length > 0) {
            steps = route.steps;
            console.log("使用步行路线数据，步骤数:", steps.length);
            
            steps.forEach(function(step) {
                if (step.path && step.path.length > 0) {
                    path = path.concat(step.path);
                } else if (step.start_location && step.end_location) {
                    path.push([step.start_location.lng, step.start_location.lat]);
                    path.push([step.end_location.lng, step.end_location.lat]);
                }
            });
        }
        // 驾车导航使用steps
        else if (mode === '驾车' && route.steps && route.steps.length > 0) {
            steps = route.steps;
            console.log("使用驾车路线数据，步骤数:", steps.length);
            
            // 添加每个步骤的路径点
            steps.forEach(function(step) {
                if (step.path && step.path.length > 0) {
                    // 如果步骤有详细路径，使用它
                    path = path.concat(step.path);
                } else if (step.start_location && step.end_location) {
                    // 否则添加起点和终点
                    path.push([step.start_location.lng, step.start_location.lat]);
                    path.push([step.end_location.lng, step.end_location.lat]);
                }
            });
        }
        
        // 如果仍然没有路径，则创建一条直线路径
        if (path.length === 0) {
            console.log("尝试创建直线路径");
            if (currentPosition && destinationMarker) {
                path = [
                    [currentPosition.lng, currentPosition.lat],
                    [destinationMarker.getPosition().lng, destinationMarker.getPosition().lat]
                ];
                console.log("创建了直线路径:", path);
                
                // 如果没有步骤信息，创建一个简单的步骤
                if (steps.length === 0) {
                    var instruction = '沿直线' + (mode === '驾车' ? '驾驶' : (mode === '骑行' ? '骑行' : '步行')) + '到达目的地';
                    steps = [{
                        instruction: instruction,
                        distance: route.distance || 0
                    }];
                }
            } else {
                console.error("导航路径数据不完整，无法构建路径");
                alert('导航路径数据不完整，无法进行导航模拟');
                clearNavigation();
                return;
            }
        }
    } else {
        path = route.path;
        steps = route.steps || route.rides || [];
    }
    
    // 确保路径数据存在
    if (path.length === 0) {
        console.error("导航路径数据不完整");
        alert('导航路径数据不完整，无法进行导航模拟');
        clearNavigation();
        return;
    }
    
    console.log("构建的路径点数量:", path.length);
    console.log("导航步骤数量:", steps.length);
    
    var currentStep = 0;
    var currentPathIndex = 0;
    var totalDistance = route.distance;
    var remainingDistance = totalDistance;
    
    console.log("总距离:", totalDistance, "米");
    
    // 显示导航路径
    if (navigationPath) {
        map.remove(navigationPath);
    }
    
    try {
        // 获取当前导航模式对应的颜色
        var navModeKey = '';
        if (mode === '驾车') navModeKey = 'driving';
        else if (mode === '骑行') navModeKey = 'riding';
        else if (mode === '步行') navModeKey = 'walking';
        
        var pathColor = navigationColors[navModeKey];
        console.log("导航模式:", mode, "颜色:", pathColor);
        
        navigationPath = new AMap.Polyline({
            path: path,
            strokeColor: pathColor,
            strokeWeight: 6,
            strokeOpacity: 0.8,
            zIndex: 100
        });
        
        map.add(navigationPath);
        
        // 自动调整地图视野以包含整个路线
        map.setFitView([navigationPath]);
        
        // 创建信息窗口显示导航指引
        if (!navigationInfoWindow) {
            navigationInfoWindow = new AMap.InfoWindow({
                offset: new AMap.Pixel(0, -30),
                closeWhenClickMap: false
            });
        }
        
        // 确保steps存在且不为空
        if (!steps || steps.length === 0) {
            console.warn("导航指引数据不完整，将只显示路线");
            alert('导航指引数据不完整，将只显示路线');
            return;
        }
        
        // 显示第一步导航指引
        var firstInstruction = steps[0].instruction || '开始' + mode + '导航';
        var firstContent = '<div class="navigation-info">' +
            '<div class="instruction">' + firstInstruction + '</div>' +
            '<div class="distance">总距离：' + (totalDistance / 1000).toFixed(2) + ' 公里</div>' +
            '<div style="color:' + pathColor + ';">导航方式：' + mode + '</div>' +
            '</div>';
        
        // 获取起点位置
        var startPosition;
        if (Array.isArray(path[0])) {
            startPosition = new AMap.LngLat(path[0][0], path[0][1]);
        } else {
            startPosition = path[0];
        }
            
        navigationInfoWindow.setContent(firstContent);
        navigationInfoWindow.open(map, startPosition);
        
        // 模拟导航过程
        window.navigationTimer = setInterval(function() {
            if (!isNavigating || currentPathIndex >= path.length - 1) {
                clearInterval(window.navigationTimer);
                
                if (currentPathIndex >= path.length - 1) {
                    // 修改：不再调用clearNavigation()
                    
                    // 创建自定义对话框而不是使用alert
                    var arrivalDialog = document.createElement('div');
                    arrivalDialog.id = 'arrivalDialog';
                    arrivalDialog.className = 'custom-dialog';
                    arrivalDialog.innerHTML = '<div class="dialog-content">' +
                        '<div class="dialog-title">导航完成</div>' +
                        '<div class="dialog-message">您已到达目的地！</div>' +
                        '<button id="confirmArrival" class="dialog-button">确定</button>' +
                        '</div>';
                    document.body.appendChild(arrivalDialog);
                    
                    // 添加确认按钮事件
                    document.getElementById('confirmArrival').addEventListener('click', function() {
                        // 移除对话框
                        document.body.removeChild(arrivalDialog);
                        
                        // 将导航路径颜色改为表示实际交通状况的颜色
                        showRealTrafficColor(path);
                    });
                    
                    // 标记导航已完成
                    navigationCompleted = true;
                    
                    // 关闭导航信息窗口
                    if (navigationInfoWindow) {
                        navigationInfoWindow.close();
                    }
                    
                    // 添加倒三角控制按钮到导航面板
                    var navigationPanel = document.getElementById('navigationPanel');
                    if (navigationPanel) {
                        // 检查是否已经存在控制按钮
                        var existingToggleBtn = navigationPanel.querySelector('.panel-toggle-button');
                        if (!existingToggleBtn) {
                            var toggleBtn = document.createElement('span');
                            toggleBtn.className = 'panel-toggle-button';
                            toggleBtn.innerHTML = '▼';
                            toggleBtn.onclick = function() {
                                if (navigationPanel.classList.contains('minimized')) {
                                    navigationPanel.classList.remove('minimized');
                                    navigationPanel.style.height = 'auto';
                                    toggleBtn.innerHTML = '▼';
                                    
                                    // 显示面板内容
                                    var panelContent = navigationPanel.querySelectorAll(':not(.panel-toggle-button)');
                                    panelContent.forEach(function(element) {
                                        element.style.display = '';
                                    });
                                } else {
                                    navigationPanel.classList.add('minimized');
                                    navigationPanel.style.height = '30px';
                                    toggleBtn.innerHTML = '◀'; // 改为左箭头，避免变形
                                    
                                    // 隐藏面板内容
                                    var panelContent = navigationPanel.querySelectorAll(':not(.panel-toggle-button)');
                                    panelContent.forEach(function(element) {
                                        element.style.display = 'none';
                                    });
                                }
                            };
                            
                            // 将按钮插入到面板的第一个元素之前
                            navigationPanel.insertBefore(toggleBtn, navigationPanel.firstChild);
                        }
                    }
                }
                
                return;
            }
            
            try {
                // 更新当前位置
                currentPathIndex += 1;
                var currentPos = path[currentPathIndex];
                
                if (!currentPos) {
                    console.error("无效的路径点:", currentPathIndex);
                    return;
                }
                
                // 如果是数组格式，转换为LngLat对象
                var markerPosition;
                if (Array.isArray(currentPos)) {
                    markerPosition = new AMap.LngLat(currentPos[0], currentPos[1]);
                } else {
                    markerPosition = currentPos;
                }
                
                navigationMarker.setPosition(markerPosition);
                
                // 计算剩余距离
                remainingDistance = totalDistance - (totalDistance * currentPathIndex / path.length);
                
                // 检查是否进入新的导航步骤
                if (currentStep < steps.length - 1) {
                    var stepPathCount = 0;
                    // 计算当前步骤的路径点数量
                    if (steps[currentStep] && steps[currentStep].path) {
                        stepPathCount = steps[currentStep].path.length;
                    }
                    
                    if (currentPathIndex >= stepPathCount) {
                        currentStep++;
                    }
                }
                
                // 更新导航指引信息
                var instruction = '沿路线' + (mode === '驾车' ? '驾驶' : (mode === '骑行' ? '骑行' : '步行'));
                if (steps[currentStep] && steps[currentStep].instruction) {
                    instruction = steps[currentStep].instruction;
                }
                    
                var content = '<div class="navigation-info">' +
                    '<div class="instruction">' + instruction + '</div>' +
                    '<div class="distance">剩余距离：' + (remainingDistance / 1000).toFixed(2) + ' 公里</div>' +
                    '<div style="color:' + pathColor + ';">导航方式：' + mode + '</div>' +
                    '</div>';
                    
                navigationInfoWindow.setContent(content);
                navigationInfoWindow.open(map, markerPosition);
                
                // 地图跟随移动，3D视角
                map.setCenter(markerPosition);
                
                // 在3D模式下调整视角，让导航更加立体
                try {
                    // 使用getStatus().viewMode代替getViewMode()
                    if (map.getStatus().viewMode === '3D') {
                        // 计算前进方向
                        if (currentPathIndex < path.length - 1) {
                            var nextPos = path[currentPathIndex + 1];
                            var nextLngLat;
                            
                            if (Array.isArray(nextPos)) {
                                nextLngLat = new AMap.LngLat(nextPos[0], nextPos[1]);
                            } else {
                                nextLngLat = nextPos;
                            }
                            
                            // 计算方向角度
                            var angle = Math.atan2(
                                nextLngLat.getLng() - markerPosition.getLng(),
                                nextLngLat.getLat() - markerPosition.getLat()
                            ) * 180 / Math.PI;
                            
                            // 设置地图旋转角度，使其朝向前进方向
                            map.setRotation(-angle);
                            
                            // 设置俯仰角，提供更好的3D视角
                            map.setPitch(45);
                            
                            // 适当缩放
                            map.setZoom(16);
                        }
                    }
                } catch (error) {
                    console.error("设置3D视角失败:", error);
                    // 继续执行，不影响导航的主要功能
                }
            } catch (error) {
                console.error("导航模拟过程中出错:", error);
                clearInterval(window.navigationTimer);
            }
        }, 500); // 每500毫秒更新一次位置
    } catch (error) {
        console.error("创建导航路线时出错:", error);
        alert("创建导航路线时出错: " + error.message);
    }
}

// 创建导航控制面板
function createNavigationControl() {
    // 不需要创建导航控制面板，函数保留为空
}

// 切换导航面板显示/隐藏
function toggleNavigationPanel() {
    // 不需要此功能，函数保留为空
}

// 恢复导航
function resumeNavigation() {
    // 不需要此功能，函数保留为空
}

// 将导航路径颜色改为表示实际交通状况的颜色
function showRealTrafficColor(path) {
    try {
        // 如果导航路径不存在，直接返回
        if (!navigationPath || !path || path.length === 0) {
            console.error("导航路径不存在，无法显示实际交通状况");
            return;
        }
        
        console.log("开始显示实际交通状况...");
        
        // 移除原有导航路径
        try {
            map.remove(navigationPath);
            navigationPath = null;
        } catch (error) {
            console.error("移除导航路径失败:", error);
        }
        
        // 删除自动添加路况图层的代码，不再自动添加路况图层
        
        // 清除之前的交通状况路段（如果存在）
        if (window.trafficSegments && window.trafficSegments.length > 0) {
            window.trafficSegments.forEach(function(segment) {
                try {
                    if (segment) {
                        map.remove(segment);
                    }
                } catch (error) {
                    console.error("移除交通状况路段失败:", error);
                }
            });
            window.trafficSegments = [];
        }
        
        // 模拟不同路段的交通状况
        // 在实际应用中，这里应该调用高德地图的交通态势API获取真实路况
        // 由于这是演示，我们将路径分为几段，并随机分配交通状况
        var segments = [];
        var segmentLength = Math.max(2, Math.floor(path.length / 5)); // 将路径分为约5段
        
        for (var i = 0; i < path.length - 1; i += segmentLength) {
            var end = Math.min(i + segmentLength, path.length);
            var segmentPath = path.slice(i, end);
            
            if (segmentPath.length < 2) {
                console.warn("路段点数不足，跳过此路段");
                continue;
            }
            
            // 随机分配交通状况：0=未知，1=畅通，2=缓行，3=拥堵
            var status = Math.floor(Math.random() * 4);
            
            // 根据交通状况设置颜色
            var color;
            switch (status) {
                case 0: // 未知
                    color = "#B0B0B0"; // 灰色
                    break;
                case 1: // 畅通
                    color = "#33CC33"; // 绿色
                    break;
                case 2: // 缓行
                    color = "#FF9900"; // 黄色
                    break;
                case 3: // 拥堵
                    color = "#CC0000"; // 红色
                    break;
                default:
                    color = "#B0B0B0"; // 默认灰色
            }
            
            try {
                // 创建路段线条
                var segment = new AMap.Polyline({
                    path: segmentPath,
                    strokeColor: color,
                    strokeWeight: 6,
                    strokeOpacity: 0.8,
                    zIndex: 90
                });
                
                segments.push(segment);
                map.add(segment);
            } catch (error) {
                console.error("创建交通状况路段失败:", error);
            }
        }
        
        // 保存路段信息，以便后续清除
        window.trafficSegments = segments;
        
        console.log("已显示实际交通状况，共" + segments.length + "个路段");
        
        // 更新导航面板
        var navigationPanel = document.getElementById('navigationPanel');
        if (navigationPanel) {
            var trafficInfo = document.createElement('div');
            trafficInfo.className = 'navigation-info';
            trafficInfo.innerHTML = 
                '<div class="instruction">实时路况信息</div>' +
                '<div class="traffic-legend">' +
                '<span style="color: #33CC33;">● 畅通</span> ' +
                '<span style="color: #FF9900;">● 缓行</span> ' +
                '<span style="color: #CC0000;">● 拥堵</span>' +
                '</div>';
            
            // 添加到导航面板
            navigationPanel.appendChild(trafficInfo);
        }
    } catch (error) {
        console.error("显示实际交通状况时发生错误:", error);
    }
}
