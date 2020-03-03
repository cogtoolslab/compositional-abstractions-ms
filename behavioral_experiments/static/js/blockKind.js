var config = require('./display_config.js');
var Block = require('./block.js');
class BlockKind {

  constructor(engine, w, h, blockColor, blockName = '') {
    // BlockKinds are a type of block- of which several might be placed
    // in the environment. To be concretely instantiated, a Block must
    // be created that inherets its properties from a BlockKind
    // BlockKind also holds the information for displaying the menu item
    // associated with that blockKind.  BlockKind width and height
    // should be given in small integers. They are scaled in the block
    // class.
    this.engine = engine;
    this.x = undefined;
    this.y = undefined;
    this.w = w;
    this.h = h;
    this.blockColor = blockColor;
    this.blockName = blockName;
  }

  // show block scaled according to given ratio, in a given location
  showMenuItem(env, x, y) {
    this.x = x;
    this.y = y;
    env.push();
    env.rectMode(env.CENTER);
    env.fill(this.blockColor);
    env.stroke([60, 90, 110]);
    env.strokeWeight(2);
    env.translate(x, y);
    env.rect(0, 0, this.w * config.sF, this.h * config.sF);
    if (config.chocolateBlocks) {
      this.drawChocolateBlocks(env);
    }
    env.pop();
  }

  drawChocolateBlocks(env) {
    // draws unit squares on each block
    var nRow = this.w;
    var nCol = this.h;
    var i = -nRow / 2 + 0.5;
    while (i < nRow / 2) {
      var j = -nCol / 2 + 0.5;
      while (j < nCol / 2) { // draw one square
        env.translate(config.sF * i, config.sF * j);
        env.rect(0, 0, config.sF, config.sF);
        env.translate(-config.sF * i, -config.sF * j);
        j++;
      }
      i++;
    }
  }

  showGhost(env, mouseX, mouseY, rotated, discreteWorld,
    disabledBlockPlacement = false, snapToGrid = true) {
    if ((mouseX > (config.sF * (this.w / 2))) &&
      (mouseX < config.canvasWidth - (config.sF * (this.w / 2)))) {

      if (snapToGrid) {
        var stim_scale = config.stim_scale;
        var snappedX;
        var x_index;
        
        var [mouseX, snappedY, x_index, y_index] = this.snapToGrid(mouseX, mouseY, discreteWorld)

        // if (this.w % 2 == 1) {
        //   snappedX = (mouseX + stim_scale / 2) % (stim_scale) < (stim_scale / 2) ? mouseX - (mouseX % (stim_scale / 2)) : mouseX - (mouseX % (stim_scale)) + (stim_scale / 2);
        //   x_index = snappedX / stim_scale - snappedX % stim_scale + 7 + 5;
        // } else {
        //   snappedX = mouseX % (stim_scale) < (stim_scale / 2) ? mouseX - mouseX % (stim_scale) : mouseX - mouseX % (stim_scale) + stim_scale;
        //   x_index = snappedX / stim_scale - snappedX % stim_scale - this.w / 2 - 5 + 5;
        // };

        // mouseX = snappedX

        // //get mouse position in terms of grid squares
        // var y = Math.round(13 - (this.h / 2) - ((mouseY + (stim_scale / 2)) / stim_scale)); // 13 HARDCODED IN- need to change to reflect maximum height (in unit squares)

        // // var rowFree = true;
        // // while (rowFree && y>=0) { //iterate down through rows from block location to find first that is free
        // //   y-=1;
        // //   var blockEnd = x_index + this.w
        // //   for (let x = x_index; x < blockEnd; x++) { // check if row directly beneath block are all free at height y
        // //     //console.log('checking:', y, x)
        // //     rowFree = rowFree && discreteWorld[x][y];
        // //   }

        // // }
        // // var y_index = y+1;
        // var y_index = y;

        // ADD SNAP TO Y
        mouseY = (
          (config.canvasHeight - config.floorHeight) -
          (config.stim_scale * (this.h / 2)) -
          (config.stim_scale * (y_index)) + config.stim_scale / 2
        );
      }

      env.push();
      env.translate(mouseX, mouseY);
      env.rectMode(env.CENTER);
      env.stroke([200, 200, 255]);
      //env.stroke([28,54,62,100]);
      env.strokeWeight(2);
      //fillColor = disabledBlockPlacement ? [100, 100, 100, 100] : [...this.blockColor];
      //fillColor[3] = 130;
      var fillColor = env.color([28, 54, 220]);
      fillColor.setAlpha(50);
      env.fill(fillColor);
      if (rotated) {
        env.rect(0, 0, this.h * config.sF, this.w * config.sF);
      } else {
        env.rect(0, 0, this.w * config.sF, this.h * config.sF);
      }
      if (config.chocolateBlocks) {
        this.drawChocolateBlocks(env);
      }
      env.pop();
    }
  }

  createSnappedBlock(preciseMouseX, preciseMouseY, discreteWorld, testing_placement) {

    var [snappedX, snappedY, x_index, y_index] = this.snapToGrid(preciseMouseX, preciseMouseY, discreteWorld)

    return new Block(this.engine, this, snappedX, snappedY, false,
      testing_placement = testing_placement, x_index = x_index, y_index = y_index);
  }


  snapToGrid(mouseX, mouseY, discreteWorld, snapY=true) {

    // snaps X location of dropped block to grid
    var snappedX;
    var x_index;
    var y_index;
    var stim_scale = config.stim_scale;

    if (this.w % 2 == 1) {
      snappedX = (mouseX + stim_scale / 2) % (stim_scale) < (stim_scale / 2) ? mouseX - (mouseX % (stim_scale / 2)) : mouseX - (mouseX % (stim_scale)) + (stim_scale / 2);
      x_index = snappedX / stim_scale - snappedX % stim_scale + 12;
    } else {
      snappedX = mouseX % (stim_scale) < (stim_scale / 2) ? mouseX - mouseX % (stim_scale) : mouseX - mouseX % (stim_scale) + stim_scale;
      x_index = snappedX / stim_scale - snappedX % stim_scale - this.w / 2;
    };

    // if (this.w % 2 == 1) {
    //   snappedX = ((preciseMouseX + config.stim_scale / 2) % (config.stim_scale) < (config.stim_scale / 2) ?
    //     preciseMouseX - (preciseMouseX % (config.stim_scale / 2)) :
    //     preciseMouseX - (preciseMouseX % (config.stim_scale)) + (config.stim_scale / 2));
    //   x_index = snappedX / config.stim_scale - snappedX % config.stim_scale + 12; // + 7 for structure world, -
    // } else if (this.h % 2 == 1) {
    //   snappedX = (preciseMouseX % (config.stim_scale) < (config.stim_scale / 2) ?
    //     preciseMouseX - preciseMouseX % (config.stim_scale) :
    //     preciseMouseX - preciseMouseX % (config.stim_scale) + config.stim_scale);
    //   x_index = snappedX / config.stim_scale - snappedX % config.stim_scale - this.w / 2;
    // } else {
    //   snappedX = (preciseMouseX % (config.stim_scale) < (config.stim_scale / 2) ?
    //     preciseMouseX - preciseMouseX % (config.stim_scale) :
    //     preciseMouseX - preciseMouseX % (config.stim_scale) + config.stim_scale);
    //   x_index = snappedX / config.stim_scale - snappedX % config.stim_scale - this.w / 2;
    // }

    if (!snapY) {
      return [snappedX, snappedY, x_index, y_index];
      // return new Block(this.engine, this, snappedX, preciseMouseY,
      //   rotated, testing_placement = testing_placement, x_index = x_index);
    } else {
      // check rows from mouse y, down
      // var y = Math.round(13 - (this.h / 2) -
      //                    ((preciseMouseY + (config.stim_scale / 2)) / config.stim_scale)) + 2;
      // let rowFree = true;
      // while (rowFree && y >= 0) {
      //   y -= 1;
      //   var blockEnd = x_index + this.w;
      //   for (let x = x_index; x < blockEnd; x++) { // check if row directly beneath block are all free at height y
      //     rowFree = rowFree && discreteWorld[x][y];
      //   }

      // }
      // y_index = y + 1;

      var y = Math.round(13 - (this.h / 2) - ((mouseY + (stim_scale / 2)) /stim_scale))

      y_index = y;

      // ADD SNAP TO Y
      var snappedY = ((config.envCanvasHeight - config.floorHeight) - (stim_scale * (this.h / 2))
        - (stim_scale * (y_index)) + stim_scale / 2 + 6);

      return [snappedX, snappedY, x_index, y_index];
    };

  };
};


module.exports = BlockKind;
