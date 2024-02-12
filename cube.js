class Cube {
  panel0;
  panel1;
  
  constructor(
    top0,
    bot0,
    top1,
    bot1,
    zFr0,
    zFr1,
    zBa,
    vert = true
  ) {
    this.panel0 = new Panel(top0, bot0, zFr0, zBa, vert);
    this.panel1 = new Panel(top1, bot1, zFr1, zBa, vert);
  }

  setVanishingPoint(x, y) {
    this.panel0.setVanishingPoint(x, y);
    this.panel1.setVanishingPoint(x, y);
  }

  getPanels() {
    return [this.panel0, this.panel1];
  }

  translatePoint(x, y, z) {
    let p0 = this.panel0.translatePoint(x, y);
    let p1 = this.panel1.translatePoint(x, y);
    return {
      x: lerp(p1.x, p0.x, z),
      y: lerp(p1.y, p0.y, z),
    }
  }

  #cube(x, y, z, width, height, depth) {
    // front plane
    let p0 = this.translatePoint(x, y, z);
    let p1 = this.translatePoint(x + width, y, z);
    let p2 = this.translatePoint(x + width, y + height, z);
    let p3 = this.translatePoint(x, y + height, z);

    // back plane
    let p4 = this.translatePoint(x, y, z + depth);
    let p5 = this.translatePoint(x + width, y, z + depth);
    let p6 = this.translatePoint(x + width, y + height, z + depth);
    let p7 = this.translatePoint(x, y + height, z + depth);

    let orders = [
      [p0, p1, p2, p3],
      [p4, p5, p6, p7],
      [p0, p1, p5, p4],
      [p2, p3, p7, p6],
      [p0, p3, p7, p4],
      [p1, p2, p6, p5],
    ];;

    ctx.beginPath();

    orders.forEach(order => {
      ctx.moveTo(order[0].x, order[0].y);

      for (let i = 1; i < order.length; i++)
        ctx.lineTo(order[i].x, order[i].y);

      ctx.lineTo(order[0].x, order[0].y);
    });
  }

  strokeCube(x, y, z, width, height, depth) {
    this.#cube(x, y, z, width, height, depth);
    ctx.stroke();
  }

  fillCube(x, y, z, width, height, depth) {
    this.#cube(x, y, z, width, height, depth);
    ctx.fill();
  }
}
