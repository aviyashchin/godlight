export function createPolygonTexture(scene, key, sides, size, color) {
    let graphics = scene.add.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(2, color, 1);
    graphics.fillStyle(color, 1);

    let points = [];
    let radius = size / 2;
    
    for (let i = 0; i < sides; i++) {
        let angle = (i / sides) * Math.PI * 2;
        let x = radius + Math.cos(angle) * radius;
        let y = radius + Math.sin(angle) * radius;
        points.push({ x, y });
    }

    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }
    
    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();

    graphics.generateTexture(key, size, size);
    graphics.destroy();
}

export function createCircleTexture(scene, key, size, color) {
    let graphics = scene.add.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(2, color, 1);
    graphics.fillStyle(color, 1);
    
    let radius = size / 2;
    graphics.beginPath();
    graphics.arc(radius, radius, radius - 1, 0, Math.PI * 2);
    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();

    graphics.generateTexture(key, size, size);
    graphics.destroy();
} 