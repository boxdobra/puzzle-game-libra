window.game = (function(){
	"use strict";
	
	var	
		//элементы
		game,
		gameDeviceleft,
		gameDeviceright,
		gameBowlLeftDrop, 
		gameBowlRightDrop, 
		gameScaleArrow, 
		gameBagsPanel,
		gameVictory,
		
		//дефолтные опции
		options = {
			bagsView: [
				{ img: 'bag-1.png',  w: 110, h: 100 },
				{ img: 'bag-2.png',  w: 66,  h: 100 },
				{ img: 'bag-3.png',  w: 88,  h: 100 },
				{ img: 'bag-4.png',  w: 89,  h: 100 },
				{ img: 'bag-5.png',  w: 54,  h: 100 },
				{ img: 'bag-6.png',  w: 100, h: 100 },
				{ img: 'bag-7.png',  w: 89,  h: 100 },
				{ img: 'bag-8.png',  w: 106, h: 100 },
				{ img: 'bag-9.png',  w: 65,  h: 100 },
				{ img: 'bag-10.png', w: 66,  h: 100 },
				{ img: 'bag-11.png', w: 59,  h: 100 },
				{ img: 'bag-12.png', w: 53,  h: 100 },
			],
			bagClass: 'game__bag',
			bagsCountOnBowl: 6,
			easyMode: false //изи режим, когда сумки изначально идут в нужном порядке
		},
		
		//данные
		isVictory,
		aBags,
		aBagsOnPanel,
		aBagsOnBowlLeft,
		aBagsOnBowlRight,
		
		//обработчики событий
		onMouseDown,
		onDragStart,
		onResize,
		
		//методы
		getNumRandom,
		createBags,
		getBagByElement,
		addBag,
		libraChange,
		functionResult;
		
	
	
	//получаем элементы
	game 				= document.querySelector('.game');
	gameDeviceleft  	= game.querySelector('.game__device-left');
	gameDeviceright 	= game.querySelector('.game__device-right');
	gameBowlLeftDrop 	= game.querySelector('.game__bowl-left-drop');
	gameBowlRightDrop 	= game.querySelector('.game__bowl-right-drop');
	gameScaleArrow 		= game.querySelector('.game__scale-arrow');
	gameBagsPanel 		= game.querySelector('.game__bags-panel');
	gameVictory			= game.querySelector('.game__victory');
	
	//обработчик нажатия на кнопку мыши
	onMouseDown = function(e){
		var bag, elBound, onMove, onUp, started, page;
		
		//игнорим если игра закончена
		if(isVictory){
			return true;
		}
		
		//реагируем только на левую кнопку мыши
		if(e.which != 1){
			return true;
		}
		
		//получаем сумку по элементу
		bag = getBagByElement(e.target);
		if(!bag){
			return true;
		}
		
		//позиции мыши и курсора
		elBound = bag.el.getBoundingClientRect();
		page = {x: e.pageX, y: e.pageY};
		
		//обработчик движения мыши
		onMove = function(e){
			if(!started && (Math.abs(page.x - e.pageX) > 2) || Math.abs(page.y - e.pageY) > 2){
				started = true;
				game.appendChild(bag.el);
			}
			if(started){
				bag.el.style.top = e.pageY - page.y + elBound.top + 'px';
				bag.el.style.left = e.pageX - page.x + elBound.left + 'px';
			}
		};
		
		//обработчик отжатия мыши
		onUp = function(e){
			if(e.type == 'mouseup' && e.which != 1){
				return true;
			}
			//добавляем сумку
			if(started){
				addBag(bag);
			}
			document.removeEventListener('mouseup', onUp);
			document.removeEventListener('mousemove', onMove);
		};
		
		document.addEventListener('mouseup', onUp);
		document.addEventListener('mousemove', onMove);
	};
	
	//запрещает дефолтный перенос картинок
	onDragStart = function(e){
		e.preventDefault();	
	};
	
	//обработчик изменения размеров страницы
	//здесь мы изменяем положение сумок, которые выкателись за пределы чаш весов или панели сумок
	onResize = function(e){
		[aBagsOnPanel, aBagsOnBowlLeft, aBagsOnBowlRight].forEach(function(bags, i){
			var parent, boundParent, width = 0;
			
			parent = !i ? gameBagsPanel : (i == 1 ? gameBowlLeftDrop : gameBowlRightDrop);
			boundParent = parent.getBoundingClientRect();
			
			for(var i in bags){
				var bag, boundBag;
				
				bag = bags[i];			
				boundBag = bag.el.getBoundingClientRect();
				
				//если сумка вышла за пределы
				if(boundBag.right > boundParent.right){
					width += boundBag.width;
					bag.el.style.left = boundParent.width - width - 5 + 'px';
					addBag(bag);
				}
			}
		});
		
	};
	
	//получаем рандомное число
	getNumRandom = function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	
	//создание сумок
	createBags = function(){
		//победы нет
		isVictory = false;
		//все сумки
		aBags = [];
		//сумки в панели сумок
		aBagsOnPanel = Object.create(null);
		//сумка в левой чаше
		aBagsOnBowlLeft = Object.create(null);
		//сумка в правой чаше
		aBagsOnBowlRight = Object.create(null);
		
		var gameBagsPanelCss = getComputedStyle(gameBagsPanel),
			gameBagPanelWidth = parseInt(gameBagsPanelCss.width) / options.bagsCountOnBowl / 2,
			gameBagPanelHeight = parseInt(gameBagsPanelCss.height),
			gameBagPanelBound = gameBagsPanel.getBoundingClientRect(),
			aBagsZ;
		
		//две чаши
		for(var b=0, bagsView = []; b<2; b++){
			var weigthLast = 600;
			
			for(var i=0; i<options.bagsCountOnBowl; i++){
				var bagWeight, el, oView;
				
				//вес
				bagWeight = (i == options.bagsCountOnBowl - 1) ? weigthLast : getNumRandom(60, 100);
				weigthLast -= bagWeight;
				
				//создаем элемент сумки
				el = document.createElement('img');
				
				//внешний вид сумки
				bagsView = bagsView.length ? bagsView : [].concat(options.bagsView);
				oView = bagsView.splice(getNumRandom(0, bagsView.length - 1), 1)[0];
				aBags.push({
					el: el,
					weight: bagWeight,
					view: oView,
				});
			}
		}
		
		//перемешиваем массив если не включен изи мод
		if(!options.easyMode){
			aBags.sort(function(a, b){
				return Math.random() < Math.random() ? -1 : 1;
			});
		}
		
		//вставляем сумки
		aBags.forEach(function(bag, i, arr){
			var el = bag.el, left, top;
			
			//присваиваем index
			el.bagIndex = i;
			//по дефолтну сумки в панели
			aBagsOnPanel[i] = bag;
			
			//внешний вид сумки
			el.src = './img/bags/' + bag.view.img;
			el.style.width = bag.view.w + 'px';
			el.style.height = bag.view.h + 'px';
			el.className = options.bagClass;
			
			//позиция
			left = i * gameBagPanelWidth + ((gameBagPanelWidth - bag.view.w) / 2);
			top = Math.max(0, (gameBagPanelHeight - bag.view.h) / 2);
			el.style.left = left + 'px';
			el.style.top = top + 'px';
			
			bag.lastLeft = left;
			bag.lastTop = top;
			bag.lastParent = gameBagsPanel;
			
			//вставляем сумку
			gameBagsPanel.appendChild(bag.el);
		});
		
		//сортируем по убыванию размеров, что бы меньшие сумки были с большим z-index
		aBagsZ = [].concat(aBags);
		aBagsZ.sort(function(a, b){
			//сортируем по той стороне, где разница в размерах наибольшая
			if(Math.abs(a.view.w - b.view.w) > Math.abs(a.view.h - b.view.h)){
				return b.view.w - a.view.w;
			}
			else {
				return b.view.h - a.view.h;
			}
		});
		
		//изменяем z-index что бы мелкие сумки были на первом плане
		aBagsZ.forEach(function(bag, i, arr){
			bag.el.style.zIndex = i + 100;
		});
	};
	
	//получить сумку по элементу
	getBagByElement = function(el){
		return aBags[el.bagIndex] || null;
	};
	
	//добавить сумку
	addBag = function(oBag){
		var boundBowlLeftDrop = gameBowlLeftDrop.getBoundingClientRect(),
			boundBowlRightDrop = gameBowlRightDrop.getBoundingClientRect(),
			boundBagsPanel = gameBagsPanel.getBoundingClientRect(),
			boundBag = oBag.el.getBoundingClientRect(),
			bagCenterX, bagCenterY, top, left, topNew, leftNew, parent, i, transitionCallback;
			
		bagCenterX = boundBag.left + boundBag.width / 2;
		bagCenterY = boundBag.top + boundBag.height / 2;
		//если втсавка в левую чашу
		if(boundBowlLeftDrop.left<= bagCenterX && boundBowlLeftDrop.right>= bagCenterX && boundBowlLeftDrop.top - 20 <= bagCenterY && boundBowlLeftDrop.bottom + 20 >= bagCenterY){
			top = boundBag.top - boundBowlLeftDrop.top;
			topNew = boundBowlLeftDrop.height - boundBag.height;
			left = boundBag.left - boundBowlLeftDrop.left;
			leftNew = Math.max(5, left);
			leftNew = Math.min(boundBowlLeftDrop.width - 5 - boundBag.width, leftNew);
			parent = gameBowlLeftDrop;
		}
		//если в правую чашу
		else if(boundBowlRightDrop.left <= bagCenterX && boundBowlRightDrop.right >= bagCenterX && boundBowlRightDrop.top - 20 <= bagCenterY && boundBowlRightDrop.bottom + 20 >= bagCenterY){
			top = boundBag.top - boundBowlRightDrop.top;
			topNew = boundBowlRightDrop.height - boundBag.height;
			left = boundBag.left - boundBowlRightDrop.left;
			leftNew = Math.max(5, left);
			leftNew = Math.min(boundBowlRightDrop.width - 5 - boundBag.width, leftNew);
			parent = gameBowlRightDrop;
		}
		//если в панель сумок
		else if(boundBagsPanel.left <= bagCenterX && boundBagsPanel.right >= bagCenterX && boundBagsPanel.top <= bagCenterY && boundBagsPanel.bottom >= bagCenterY){
			top = boundBag.top - boundBagsPanel.top;
			topNew = boundBagsPanel.height - boundBag.height - (boundBagsPanel.height - boundBag.height) / 2;
			left = boundBag.left - boundBagsPanel.left;
			leftNew = Math.max(5, left);
			leftNew = Math.min(boundBagsPanel.width - 5 - boundBag.width, leftNew);
			parent = gameBagsPanel;
		}
		//попытка дропнуть в другие места
		else {
			var lastBound = oBag.lastParent.getBoundingClientRect();
			top = boundBag.top - lastBound.top;
			left = boundBag.left - lastBound.left;
			topNew = oBag.lastTop;
			leftNew = Math.max(5, oBag.lastLeft);
			leftNew = Math.min(lastBound.width - 5 - boundBag.width, leftNew);
			parent = oBag.lastParent;
		}
		
		//положение до анимации перемещения
		oBag.el.style.top = top + 'px';
		oBag.el.style.left = left + 'px';
		parent.appendChild(oBag.el);
		
		//анимируем
		oBag.el.offsetHeight;
		oBag.el.style.transition = 'top 0.3s ease-out 0s, left 0.3s ease-out 0s';
		
		transitionCallback = function(e){
			if(e.target != oBag.el || e.propertyName != 'top'){
				return true;
			}
			oBag.el.style.transition = '';
			oBag.el.removeEventListener('transitionend', transitionCallback);
		};
		
		oBag.el.addEventListener('transitionend', transitionCallback);
		
		oBag.el.style.top = topNew + 'px';
		oBag.el.style.left = leftNew + 'px';
		
		//колбэк анимации
		if(parent != oBag.lastParent){
			//удаляем сумку из списков
			i = oBag.el.bagIndex;
			delete aBagsOnPanel[i];
			delete aBagsOnBowlLeft[i];
			delete aBagsOnBowlRight[i];
			//добавляем
			if(parent == gameBagsPanel){
				aBagsOnPanel[i] = oBag;
			}
			else if(parent == gameBowlLeftDrop){
				aBagsOnBowlLeft[i] = oBag;
			}
			else if(parent == gameBowlRightDrop){
				aBagsOnBowlRight[i] = oBag;
			}
			
			oBag.lastTop = topNew;
			oBag.lastLeft = leftNew;
			oBag.lastParent = parent;
			
			//калькуляция
			libraChange();
		}
	};
	
	//изменение параметров весов
	libraChange = function(){
		var weightBowlLeft = 0, 
			weightBowlRight = 0,
			angleScale,
			delta,
			sign,
			countBags = 0,
			bowlHeightDefault = 100,
			bowlHeight,
			animateTime,
			animateTimeMin = 0.6,
			animateTimeMax = 2,
			animateCallback;
		
		for(var i in aBagsOnBowlLeft){
			weightBowlLeft += aBagsOnBowlLeft[i].weight;
			countBags++;
		}
		for(var i in aBagsOnBowlRight){
			weightBowlRight += aBagsOnBowlRight[i].weight;
			countBags++;
		}
		
		//победа?
		if(countBags == options.bagsCountOnBowl*2 && weightBowlLeft == weightBowlRight){
			isVictory = true;
		}
		
		delta = (weightBowlRight - weightBowlLeft == 0) ? 0 : (weightBowlRight - weightBowlLeft) / 600;
		sign = delta < 0 ? -1 : 1;
		delta = Math.abs(delta);
		angleScale = sign * Math.min(90, delta * 90);
		bowlHeight = sign * Math.min(bowlHeightDefault, bowlHeightDefault * delta);
		animateTime = animateTimeMin / delta;
		animateTime = Math.min(animateTimeMax, animateTime);
		
		gameScaleArrow.style.transition = 'transform '+animateTime+'s cubic-bezier(.08,.75,.23,1) 0s';
		gameDeviceleft.style.transition = 'height '+animateTime+'s cubic-bezier(.08,.75,.23,1) 0s';
		gameDeviceright.style.transition = 'height '+animateTime+'s cubic-bezier(.08,.75,.23,1) 0s';
		
		//колбэк анимации
		animateCallback = function(e){
			if(e.target != gameScaleArrow || e.propertyName != 'transform'){
				return true;
			}
			if(isVictory){
				gameVictory.style.display = 'block';
			}
			gameScaleArrow.removeEventListener('transitionend', animateCallback);
		};
		
		gameScaleArrow.addEventListener('transitionend', animateCallback);
		
		gameScaleArrow.style.transform = 'rotate('+ angleScale +'deg)';
		gameDeviceleft.style.height = bowlHeightDefault + bowlHeight  + 'px';
		gameDeviceright.style.height = bowlHeightDefault - bowlHeight + 'px';
	};
	
	functionResult = function(){		
		//вешаем обработчики
		game.addEventListener('mousedown', onMouseDown);
		game.addEventListener('dragstart', onDragStart);
		window.addEventListener('resize', onResize);
		
		//создаем сумки
		createBags();
	}
	
	functionResult.destroy = function(){
		game.removeEventListener('mousedown', onMouseDown);
		game.removeEventListener('dragstart', onDragStart);
		window.removeEventListener('resize', onResize);
		gameVictory.style.display = '';
	}

	return functionResult;
})();