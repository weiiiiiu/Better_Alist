//底部跳动的鱼
const RENDERER = {
	POINT_INTERVAL: 5,
	FISH_COUNT: 3,
	MAX_INTERVAL_COUNT: 50,
	INIT_HEIGHT_RATE: 0.5,
	THRESHOLD: 50,
	WATCH_INTERVAL: 100,

	init() {
		this.setParameters();
		this.bindMethods();
		this.setup();
		this.bindEvents();
		this.render();
	},

	setParameters() {
		this.$window = $(window);
		this.$container = $('#jsi-flying-fish-container');
		this.$canvas = $('<canvas />');
		this.context = this.$canvas.appendTo(this.$container).get(0).getContext('2d');
		this.points = [];
		this.fishes = [];
		this.watchIds = [];
	},

	createSurfacePoints() {
		const count = Math.round(this.width / this.POINT_INTERVAL);
		this.pointInterval = this.width / (count - 1);
		
		for(let i = 0; i < count; i++) {
			const point = new SURFACE_POINT(this, i * this.pointInterval);
			if(i > 0) {
				const previous = this.points[i - 1];
				point.setPreviousPoint(previous);
				previous.setNextPoint(point);
			}
			this.points.push(point);
		}
	},

	bindMethods() {
		['watchWindowSize', 'judgeToStopResize', 'startEpicenter', 
		 'moveEpicenter', 'reverseVertical', 'render'].forEach(method => {
			this[method] = this[method].bind(this);
		});
	},

	setup() {
		[this.points, this.fishes, this.watchIds].forEach(arr => arr.length = 0);
		
		this.intervalCount = this.MAX_INTERVAL_COUNT;
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.fishCount = this.FISH_COUNT * this.width / 500 * this.height / 500;
		
		this.$canvas.attr({width: this.width, height: this.height});
		this.reverse = false;
		
		this.fishes.push(new FISH(this));
		this.createSurfacePoints();
	},

	watchWindowSize() {
		this.clearTimer();
		[this.tmpWidth, this.tmpHeight] = [this.$window.width(), this.$window.height()];
		this.watchIds.push(setTimeout(this.judgeToStopResize, this.WATCH_INTERVAL));
	},

	clearTimer() {
		while(this.watchIds.length) {
			clearTimeout(this.watchIds.pop());
		}
	},

	judgeToStopResize() {
		const [width, height] = [this.$window.width(), this.$window.height()];
		const stopped = width === this.tmpWidth && height === this.tmpHeight;
		
		[this.tmpWidth, this.tmpHeight] = [width, height];
		
		if(stopped) this.setup();
	},

	bindEvents() {
		this.$window.on('resize', this.watchWindowSize);
		this.$container.on({
			mouseenter: this.startEpicenter,
			mousemove: this.moveEpicenter,
			click: this.reverseVertical
		});
	},

	getAxis(event) {
		const offset = this.$container.offset();
		return {
			x: event.clientX - offset.left + this.$window.scrollLeft(),
			y: event.clientY - offset.top + this.$window.scrollTop()
		};
	},

	startEpicenter(event) {
		this.axis = this.getAxis(event);
	},

	moveEpicenter(event) {
		const axis = this.getAxis(event);
		if(!this.axis) this.axis = axis;
		
		this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y);
		this.axis = axis;
	},

	generateEpicenter(x, y, velocity) {
		if(y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD) return;
		
		const index = Math.round(x / this.pointInterval);
		if(index < 0 || index >= this.points.length) return;
		
		this.points[index].interfere(y, velocity);
	},

	reverseVertical() {
		this.reverse = !this.reverse;
		this.fishes.forEach(fish => fish.reverseVertical());
	},

	controlStatus() {
		this.points.forEach(point => {
			point.updateSelf();
			point.updateNeighbors();
		});

		if(this.fishes.length < this.fishCount) {
			if(--this.intervalCount === 0) {
				this.intervalCount = this.MAX_INTERVAL_COUNT;
				this.fishes.push(new FISH(this));
			}
		}
	},

	render() {
		requestAnimationFrame(this.render);
		this.controlStatus();
		
		const ctx = this.context;
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.fillStyle = 'hsl(0, 0%, 95%)';
		
		this.fishes.forEach(fish => fish.render(ctx));
		
		ctx.save();
		ctx.globalCompositeOperation = 'xor';
		ctx.beginPath();
		ctx.moveTo(0, this.reverse ? 0 : this.height);
		
		this.points.forEach(point => point.render(ctx));
		
		ctx.lineTo(this.width, this.reverse ? 0 : this.height);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
};

class SURFACE_POINT {
	constructor(renderer, x) {
		this.renderer = renderer;
		this.x = x;
		this.init();
	}

	static SPRING_CONSTANT = 0.03;
	static SPRING_FRICTION = 0.9;
	static WAVE_SPREAD = 0.3;
	static ACCELERATION_RATE = 0.01;

	init() {
		this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
		this.height = this.initHeight;
		this.fy = 0;
		this.force = {previous: 0, next: 0};
	}

	setPreviousPoint(previous) {
		this.previous = previous;
	}

	setNextPoint(next) {
		this.next = next;
	}

	interfere(y, velocity) {
		const direction = (this.renderer.height - this.height - y) >= 0 ? -1 : 1;
		this.fy = this.renderer.height * SURFACE_POINT.ACCELERATION_RATE * direction * Math.abs(velocity);
	}

	updateSelf() {
		this.fy += SURFACE_POINT.SPRING_CONSTANT * (this.initHeight - this.height);
		this.fy *= SURFACE_POINT.SPRING_FRICTION;
		this.height += this.fy;
	}

	updateNeighbors() {
		if(this.previous) {
			this.force.previous = SURFACE_POINT.WAVE_SPREAD * (this.height - this.previous.height);
		}
		if(this.next) {
			this.force.next = SURFACE_POINT.WAVE_SPREAD * (this.height - this.next.height);
		}
	}

	render(ctx) {
		if(this.previous) {
			this.previous.height += this.force.previous;
			this.previous.fy += this.force.previous;
		}
		if(this.next) {
			this.next.height += this.force.next;
			this.next.fy += this.force.next;
		}
		ctx.lineTo(this.x, this.renderer.height - this.height);
	}
}

class FISH {
	constructor(renderer) {
		this.renderer = renderer;
		this.init();
	}

	static GRAVITY = 0.4;

	init() {
		this.direction = Math.random() < 0.5;
		this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this.renderer.THRESHOLD;
		this.previousY = this.y;
		this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);
		
		if(this.renderer.reverse) {
			this.y = this.getRandomValue(this.renderer.height * 0.1, this.renderer.height * 0.4);
			this.vy = this.getRandomValue(2, 5);
			this.ay = this.getRandomValue(0.05, 0.2);
		} else {
			this.y = this.getRandomValue(this.renderer.height * 0.6, this.renderer.height * 0.9);
			this.vy = this.getRandomValue(-5, -2);
			this.ay = this.getRandomValue(-0.2, -0.05);
		}
		
		this.isOut = false;
		this.theta = 0;
		this.phi = 0;
	}

	getRandomValue(min, max) {
		return min + (max - min) * Math.random();
	}

	reverseVertical() {
		this.isOut = !this.isOut;
		this.ay *= -1;
	}

	controlStatus() {
		this.previousY = this.y;
		this.x += this.vx;
		this.y += this.vy;
		this.vy += this.ay;
		
		if(this.renderer.reverse) {
			if(this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
				this.vy -= FISH.GRAVITY;
				this.isOut = true;
			} else {
				if(this.isOut) {
					this.ay = this.getRandomValue(0.05, 0.2);
				}
				this.isOut = false;
			}
		} else {
			if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
				this.vy += FISH.GRAVITY;
				this.isOut = true;
			} else {
				if(this.isOut) {
					this.ay = this.getRandomValue(-0.2, -0.05);
				}
				this.isOut = false;
			}
		}

		if(!this.isOut) {
			this.theta = (this.theta + Math.PI / 20) % (Math.PI * 2);
			this.phi = (this.phi + Math.PI / 30) % (Math.PI * 2);
		}

		this.renderer.generateEpicenter(
			this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD,
			this.y,
			this.y - this.previousY
		);

		if((this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD) || 
		   (this.vx < 0 && this.x < -this.renderer.THRESHOLD)) {
			this.init();
		}
	}

	render(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(Math.PI + Math.atan2(this.vy, this.vx));
		ctx.scale(1, this.direction ? 1 : -1);
		
		// Draw fish body
		ctx.beginPath();
		ctx.moveTo(-30, 0);
		ctx.bezierCurveTo(-20, 15, 15, 10, 40, 0);
		ctx.bezierCurveTo(15, -10, -20, -15, -30, 0);
		ctx.fill();
		
		// Draw tail
		ctx.save();
		ctx.translate(40, 0);
		ctx.scale(0.9 + 0.2 * Math.sin(this.theta), 1);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(5, 10, 20, 8);
		ctx.quadraticCurveTo(12, 5, 10, 0);
		ctx.quadraticCurveTo(12, -5, 20, -8);
		ctx.quadraticCurveTo(5, -10, 0, 0);
		ctx.fill();
		ctx.restore();
		
		// Draw fin
		ctx.save();
		ctx.translate(-3, 0);
		ctx.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1));
		ctx.beginPath();
		
		if(this.renderer.reverse) {
			ctx.moveTo(5, 0);
			ctx.bezierCurveTo(10, 10, 10, 30, 0, 40);
			ctx.bezierCurveTo(-12, 25, -8, 10, 0, 0);
		} else {
			ctx.moveTo(-5, 0);
			ctx.bezierCurveTo(-10, -10, -10, -30, 0, -40);
			ctx.bezierCurveTo(12, -25, 8, -10, 0, 0);
		}
		ctx.closePath();
		ctx.fill();
		ctx.restore();
		ctx.restore();
		
		this.controlStatus();
	}
}

$(function() {
	RENDERER.init();
});
