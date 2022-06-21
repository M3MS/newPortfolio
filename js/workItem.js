import gsap from 'gsap';

const body = document.body;
const docEl = document.documentElement;

const lineEq = (y2, y1, x2, x1, currentVal) => {
    // y = mx + b 
    var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
    return m * currentVal + b;
};

const distance = (x1,x2,y1,y2) => {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.hypot(a,b);
};

const lerp = (a, b, n) => (1 - n) * a + n * b;

// Gets the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

let winsize;

const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};

calcWinsize();

window.addEventListener('resize', calcWinsize);

const feDisplacementMapEl = document.querySelector('feDisplacementMap');

export default class workHover {
    constructor() {
        this.DOM = {
            svg: document.querySelector('svg.distort'),
            menu: document.querySelector('.work__items')
        };
        this.DOM.imgs = [...this.DOM.svg.querySelectorAll('g > image')];
        this.DOM.menuLinks = [...this.DOM.menu.querySelectorAll('.work__item a')];
        this.mousePos = {x: winsize.width/2, y: winsize.height/2};
        this.lastMousePos = {
            translation: {x: winsize.width/2, y: winsize.height/2},
            displacement: {x: 0, y: 0}
        };
        this.dmScale = 0;

        this.current = -1;
        
        this.initEvents();
        requestAnimationFrame(() => this.render());
    }

    calcBounds() {
        this.bounds = {
            el: this.DOM.el.getBoundingClientRect(),
            reveal: this.DOM.reveal.getBoundingClientRect()
        };
    }

    initEvents() {
        window.addEventListener('mousemove', ev => this.mousePos = getMousePos(ev));

        this.DOM.menuLinks.forEach((item, pos) => {

            const mouseenterFn = () => {

                if ( this.current !== -1 ) {
                   gsap.set(this.DOM.imgs[this.current], {opacity: 0});
                }
                this.current = pos;

                if ( this.fade ) {
                    gsap.to(this.DOM.imgs[this.current], 0.5, {ease: 'power1.out', opacity: 1});
                    this.fade = false;
                }
                else {
                    gsap.set(this.DOM.imgs[this.current], {opacity: 1});
                }
            };
            item.addEventListener('mouseenter', mouseenterFn);
        });

        const mousemenuenterFn = () => this.fade = true;
        const mousemenuleaveFn = () => gsap.to(this.DOM.imgs[this.current], .2, {ease: ' power1.out', opacity: 0});
        
        this.DOM.menu.addEventListener('mouseenter', mousemenuenterFn);
        this.DOM.menu.addEventListener('mouseleave', mousemenuleaveFn);
    }
    render() {
        this.lastMousePos.translation.x = lerp(this.lastMousePos.translation.x, this.mousePos.x, 0.1);
        this.lastMousePos.translation.y = lerp(this.lastMousePos.translation.y, this.mousePos.y, 0.1);
        this.DOM.svg.style.transform = `translateX(${(this.lastMousePos.translation.x-winsize.width/4)}px) translateY(${this.lastMousePos.translation.y-winsize.height/4}px)`;
        
        // Scale goes from 0 to 100 for mouseDistance values between 0 to 100
        this.lastMousePos.displacement.x = lerp(this.lastMousePos.displacement.x, this.mousePos.x, 0.1);
        this.lastMousePos.displacement.y = lerp(this.lastMousePos.displacement.y, this.mousePos.y, 0.1);
        const mouseDistance = distance(this.lastMousePos.displacement.x, this.mousePos.x, this.lastMousePos.displacement.y, this.mousePos.y);
        this.dmScale = Math.min(lineEq(50, 0, 140, 0, mouseDistance), 50);
        feDisplacementMapEl.scale.baseVal = this.dmScale;

        requestAnimationFrame(() => this.render());
    }
}