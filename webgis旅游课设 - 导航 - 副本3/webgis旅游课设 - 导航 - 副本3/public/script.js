// 初始化地图
var map = new AMap.Map('mapContainer', {
    zoom: 11,
    center: [115.892111, 28.676493],
    layers: [new AMap.TileLayer()]
});

// 新增路况图层
var trafficLayer = new AMap.TileLayer.Traffic({
    zIndex: 10
});

// 景点数据，新增 url 字段表示对应的网页地址
var attractions = [
    { name: '滕王阁', position: [115.881141, 28.681356], color: 'red', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%B8%82%E6%BB%95%E7%8E%8B%E9%98%81%E6%97%85%E6%B8%B8%E5%8C%BA/65002156?fr=aladdin' },
    { name: '八一起义纪念馆', position: [115.889435, 28.67467], color: 'red', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E5%85%AB%E4%B8%80%E8%B5%B7%E4%B9%89%E7%BA%AA%E5%BF%B5%E9%A6%86/2121335' },
    { name: '秋水广场', position: [115.86273, 28.682634], color: 'red', url: 'https://baike.baidu.com/item/%E7%A7%8B%E6%B0%B4%E5%B9%BF%E5%9C%BA?fromModule=lemma_search-box' },
    { name: '南昌之星摩天轮', position: [115.850254, 28.655929], color: 'red', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E4%B9%8B%E6%98%9F%E6%91%A9%E5%A4%A9%E8%BD%AE?fromModule=lemma_search-box' },
    { name: '海昏侯国遗址博物馆', position: [115.939837, 29.030113], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E6%B1%89%E4%BB%A3%E6%B5%B7%E6%98%8F%E4%BE%AF%E5%9B%BD%E5%9B%BD%E5%AE%B6%E8%80%83%E5%8F%A4%E9%81%97%E5%9D%80%E5%85%AC%E5%9B%AD?fromtitle=%E6%B5%B7%E6%98%8F%E4%BE%AF%E5%9B%BD%E9%81%97%E5%9D%80%E5%85%AC%E5%9B%AD&fromid=19467914&fromModule=lemma_search-box' },
    { name: '万寿宫', position: [116.367573, 39.878825], color: 'blue', url: 'https://baike.baidu.com/item/%E5%8D%97%E6%98%8C%E4%B8%87%E5%AF%BF%E5%AE%AB/22186097?fromModule=lemma_sense-layer#viewPageContent' },
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
    { name: '秦胖子肉陀良心店', position: [115.892861, 28.666733], color: 'blue' }
];

// 存储当前位置
var currentPosition;

// 登录验证
function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
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
        if (navigator.geolocation) {
            map.plugin('AMap.Geolocation', function () {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,
                    timeout: 10000
                });
                geolocation.getCurrentPosition(function (status, result) {
                    if (status === 'complete') {
                        currentPosition = result.position;
                        map.setCenter(result.position);
                        map.setZoom(15);
                    } else {
                        alert('定位失败，请手动选择景点');
                    }
                });
            });
        } else {
            alert('您的浏览器不支持定位功能');
        }
    });

    // 导航功能
    document.getElementById('navigateButton').addEventListener('click', function () {
        if (!currentPosition) {
            alert('请先定位到您的位置');
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

        // 构造高德地图导航 URL
        var amapNaviUrl = `https://uri.amap.com/navigation?from=${currentPosition.lng},${currentPosition.lat},当前位置&to=${selectedAttraction.position[0]},${selectedAttraction.position[1]},${selectedAttractionName}&mode=car&src=mypage&coordinate=gaode&callnative=0`;

        // 打开高德地图导航页面
        window.open(amapNaviUrl, '_blank');
    });

    // 地图类型切换功能
    document.querySelectorAll('input[name="mapType"]').forEach(function (input) {
        input.addEventListener('change', function () {
            if (this.value === 'normal') {
                map.setLayers([new AMap.TileLayer()]);
            } else if (this.value === 'satellite') {
                map.setLayers([new AMap.TileLayer.Satellite()]);
            } else if (this.value === 'traffic') {
                map.add(trafficLayer);
            } else {
                map.remove(trafficLayer);
            }
        });
    });
}

// 显示登录模态框
window.onload = function () {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('loginButton').addEventListener('click', login);
};

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
