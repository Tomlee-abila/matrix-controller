class PixelEditor {
  constructor() {
    this.currentColor = "#000000";
    this.currentTool = "pencil";
    this.gridSize = 8;
    this.frames = [];
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animationSpeed = 5;
    this.esp32Connected = false;
    this.esp32IP = "";

    this.initializeGrid();
    this.setupEventListeners();
    this.addFrame();
    this.updateColorPicker();
  }

  updateColorPicker() {
    const toolbar = document.querySelector(".toolbar");

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.id = "colorPicker";
    colorPicker.className = "color-picker";
    colorPicker.value = this.currentColor;
    colorPicker.addEventListener("change", (e) => {
      this.currentColor = e.target.value;
    });

    toolbar.insertBefore(colorPicker, toolbar.children[2]);
  }

  initializeGrid() {
    const grid = document.getElementById("grid");
    grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 20px)`;

    grid.innerHTML = "";
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      pixel.dataset.index = i;
      pixel.style.backgroundColor = "black"; // Set default color to black
      grid.appendChild(pixel);
    }
  }

  setupEventListeners() {
    const grid = document.getElementById("grid");
    let isDrawing = false;

    document.getElementById("gridSize").addEventListener("change", (e) => {
      this.gridSize = parseInt(e.target.value);
      this.initializeGrid();
    });

    document.getElementById("speed").addEventListener("input", (e) => {
      this.animationSpeed = parseInt(e.target.value, 10);
      console.log("Animation Speed updated to:", this.animationSpeed);
    });

    document
      .getElementById("presetAnimations")
      .addEventListener("change", (e) => {
        const presetName = e.target.value;
        if (presetName) {
          const presets = this.getPresetAnimations();
          const preset = presets[presetName];

          if (preset) {
            this.gridSize = preset.gridSize;
            this.frames = [...preset.frames];
            this.currentFrame = 0;
            this.animationSpeed = preset.speed;

            document.getElementById("gridSize").value = this.gridSize;
            this.initializeGrid();
            this.loadFrame(0);
            this.updateTimeline();

            e.target.value = "";
          }
        }
      });

    document.getElementById("pencilTool").addEventListener("click", () => {
      this.currentTool = "pencil";
    });

    document.getElementById("eraserTool").addEventListener("click", () => {
      this.currentTool = "eraser";
    });

    grid.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.target.classList.contains("pixel")) {
        isDrawing = true;
        const color =
          this.currentTool === "pencil" ? this.currentColor : "black"; // Change eraser color to black
        e.target.style.backgroundColor = color;
        this.updateFrame();
      }
    });

    grid.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (isDrawing && e.target.classList.contains("pixel")) {
        const color =
          this.currentTool === "pencil" ? this.currentColor : "black"; // Change eraser color to black
        e.target.style.backgroundColor = color;
        this.updateFrame();
      }
    });

    grid.addEventListener("mouseup", (e) => {
      isDrawing = false;
    });

    grid.addEventListener("mouseleave", (e) => {
      isDrawing = false;
    });

    grid.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    document.getElementById("addFrame").addEventListener("click", () => {
      this.addFrame();
    });

    document.getElementById("playAnimation").addEventListener("click", () => {
      this.toggleAnimation();
    });

    document.getElementById("connect").addEventListener("click", () => {
      this.connectToESP32();
    });

    document.getElementById("sendAnimation").addEventListener("click", () => {
      this.sendAnimationToESP32();
    });

    document
      .getElementById("downloadAnimation")
      .addEventListener("click", () => {
        this.downloadAnimation();
      });

    document.getElementById("uploadAnimation").addEventListener("click", () => {
      this.uploadAnimation();
    });

    document.getElementById("clearGrid").addEventListener("click", () => {
      const pixels = document.querySelectorAll(".pixel");
      pixels.forEach((pixel) => {
        pixel.style.backgroundColor = "black"; // Make clear button turn all pixels black
      });
      this.updateFrame();
    });
  }

  getPresetAnimations() {
    return {
      heart: {
        gridSize: 8,
        frames: [
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const heartPattern1 = [
                18, 19, 21, 22, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 43,
                44, 45, 52,
              ];
              return heartPattern1.includes(i) ? "#ff0000" : "black";
            }),
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const heartPattern2 = [
                17, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
                35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 51, 52, 53,
              ];
              return heartPattern2.includes(i) ? "#ff0000" : "black";
            }),
        ],
        speed: 2,
      },
      pacman: {
        gridSize: 8,
        frames: [
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const pacmanOpen = [
                18, 19, 20, 25, 26, 27, 28, 29, 33, 34, 35, 36, 41, 42, 43, 44,
                49, 50, 51,
              ];
              return pacmanOpen.includes(i) ? "#ffff00" : "black";
            }),
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const pacmanClosed = [
                18, 19, 20, 25, 26, 27, 28, 29, 33, 34, 35, 36, 37, 41, 42, 43,
                44, 45, 49, 50, 51, 52,
              ];
              return pacmanClosed.includes(i) ? "#ffff00" : "black";
            }),
        ],
        speed: 4,
      },
      snake: {
        gridSize: 8,
        frames: [
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const snake1 = [11, 12, 13, 14];
              return snake1.includes(i) ? "#00ff00" : "black";
            }),
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const snake2 = [12, 13, 14, 15];
              return snake2.includes(i) ? "#00ff00" : "black";
            }),
          Array(64)
            .fill("black")
            .map((color, i) => {
              // Change default to black
              const snake3 = [13, 14, 15, 16];
              return snake3.includes(i) ? "#00ff00" : "black";
            }),
        ],
        speed: 3,
      },
    };
  }

  addFrame() {
    const frameData = new Array(this.gridSize * this.gridSize).fill("black"); // Change default to black
    this.frames.push(frameData);
    this.currentFrame = this.frames.length - 1;
    this.updateTimeline();
  }

  deleteFrame(index) {
    if (this.frames.length <= 1) {
      alert("Cannot delete the last frame!");
      return;
    }

    this.frames.splice(index, 1);
    if (this.currentFrame >= this.frames.length) {
      this.currentFrame = this.frames.length - 1;
    }
    this.loadFrame(this.currentFrame);
    this.updateTimeline();
  }

  updateFrame() {
    const pixels = document.querySelectorAll(".pixel");
    this.frames[this.currentFrame] = Array.from(pixels).map(
      (p) => p.style.backgroundColor || "black"
    ); // Change default to black
    this.updateTimeline();
  }

  updateTimeline() {
    const timeline = document.getElementById("frames");
    timeline.innerHTML = "";

    this.frames.forEach((frame, index) => {
      const frameEl = document.createElement("div");
      frameEl.className = `frame ${
        index === this.currentFrame ? "active" : ""
      }`;

      const deleteBtn = document.createElement("div");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "×";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteFrame(index);
      });

      frameEl.appendChild(deleteBtn);
      frameEl.addEventListener("click", () => {
        this.currentFrame = index;
        this.loadFrame(index);
      });

      timeline.appendChild(frameEl);
    });
  }

  loadFrame(index) {
    const pixels = document.querySelectorAll(".pixel");
    pixels.forEach((pixel, i) => {
      pixel.style.backgroundColor = this.frames[index][i];
    });
    this.currentFrame = index;
    this.updateTimeline();
  }

  toggleAnimation() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playAnimation();
    }
  }

  playAnimation() {
    if (!this.isPlaying) return;

    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    this.loadFrame(this.currentFrame);

    setTimeout(() => {
      this.playAnimation();
    }, 1000 / this.animationSpeed);
  }

  downloadAnimation() {
    const animationData = {
      gridSize: this.gridSize,
      frames: this.frames,
      speed: this.animationSpeed,
    };

    const dataStr = JSON.stringify(animationData);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportName = "pixel_animation_" + new Date().getTime() + ".json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();
  }

  uploadAnimation() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const animationData = JSON.parse(event.target.result);
          if (animationData.frames && animationData.gridSize) {
            this.gridSize = animationData.gridSize;
            this.frames = animationData.frames;
            this.currentFrame = 0;

            document.getElementById("gridSize").value = this.gridSize;
            this.initializeGrid();
            this.loadFrame(0);
            this.updateTimeline();
          }
        } catch (error) {
          console.error("Failed to parse animation file:", error);
          alert("Invalid animation file format");
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  async connectToESP32() {
    const ip = document.getElementById("esp32IP").value;
    try {
      const response = await fetch(`http://${ip}/connect`);
      if (response.ok) {
        this.esp32Connected = true;
        this.esp32IP = ip;
        document.getElementById("status").className = "status connected";
        document.getElementById("status").textContent = "Connected";
      }
    } catch (error) {
      console.error("Failed to connect to ESP32:", error);
      document.getElementById("status").className = "status disconnected";
      document.getElementById("status").textContent = "Connection Failed";
    }
  }

  async sendAnimationToESP32() {
    if (!this.esp32Connected) return;

    try {
      const animationData = {
        gridSize: this.gridSize,
        frames: this.frames,
      };

      const response = await fetch(`http://${this.esp32IP}/animation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(animationData),
      });

      if (response.ok) {
        alert("Animation sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send animation:", error);
      alert("Failed to send animation to ESP32");
    }
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  window.pixelEditor = new PixelEditor();
});
