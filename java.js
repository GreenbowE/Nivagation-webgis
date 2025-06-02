// 扩展点1：添加实时定位
function initGeolocation() {
    AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation();
        geolocation.getCurrentPosition((status, result) => {
            if(status === 'complete') {
                console.log('定位成功:', result);
            }
        });
    });
}

// 扩展点2：热力图可视化
function showHeatmap() {
    AMap.plugin('AMap.Heatmap', () => {
        const heatmap = new AMap.Heatmap(map, {
            radius: 25,  // 热力点半径
            opacity: [0, 0.8]
        });
        heatmap.setDataSet({
            data: allPois.map(poi => ({
                lng: poi.location.lng,
                lat: poi.location.lat,
                count: poi.rating * 10
            }))
        });
    });
}

// 扩展点3：轨迹播放
function playTrack(positions) {
    const marker = new AMap.Marker({
        icon: 'car.png',
        offset: new AMap.Pixel(-15, -15)
    });
    
    let index = 0;
    const timer = setInterval(() => {
        if(index < positions.length) {
            marker.setPosition(positions[index++]);
        } else {
            clearInterval(timer);
        }
    }, 500);
}