(function() {
   'use strict';

   window.GameLibra = GameLibra;

   // Дефолтные опции
   var OPTIONS_DEFAULT = {
      // Параметры фотографий сумок
      bags: [
         {img: 'bag-1.png',  w: 110, h: 100},
         {img: 'bag-2.png',  w: 66,  h: 100},
         {img: 'bag-3.png',  w: 88,  h: 100},
         {img: 'bag-4.png',  w: 89,  h: 100},
         {img: 'bag-5.png',  w: 54,  h: 100},
         {img: 'bag-6.png',  w: 100, h: 100},
         {img: 'bag-7.png',  w: 89,  h: 100},
         {img: 'bag-8.png',  w: 106, h: 100},
         {img: 'bag-9.png',  w: 65,  h: 100},
         {img: 'bag-10.png', w: 66,  h: 100},
         {img: 'bag-11.png', w: 59,  h: 100},
         {img: 'bag-12.png', w: 53,  h: 100}
      ],

      // Селектор
      selector: '.gameLibra',

      // Кол-во сумок на одной чаше
      bagsCount: 6,

      // Изи режим, когда сумки изначально идут в нужном порядке
      easyMode: false
   };

   // Класс
   function GameLibra(options) {
      var self = this;

      // Применяем опции
      this._setOptions(options);

      // Получаем элементы
      this._elements = this._getElements(this._options.selector);

      if (!this._elements.game) {
         throw 'Элемент с указанным селектором не найден';
      }

      if (this._elements.game.gameLibra) {
         throw 'На элементе с указанным селектором уже создан экземпляр игры';
      }

      this._elements.game.gameLibra = this;
      this._onMouseDown = onMouseDown.bind(this);
      this._onDragStart = onDragStart.bind(this);
      this._onResize = onResize.bind(this);

      // Вешаем обработчики
      this._elements.game.addEventListener('mousedown', self._onMouseDown);
      this._elements.game.addEventListener('dragstart', self._onDragStart);
      window.addEventListener('resize', self._onResize);

      // Публичные методы
      this.start = this._start;
      this.destroy = this._destroy;
   }

   // Старт игры (в том числе рестарт)
   GameLibra.prototype._start = function() {
      this._reset();
      this._createBags();
   };

   // Выключаем игру
   GameLibra.prototype._destroy = function() {
      delete this._elements.game.gameLibra;
      this._elements.gameVictory.style.display = '';
      this._elements.game.removeEventListener('mousedown', this._onMouseDown);
      this._elements.game.removeEventListener('dragstart', this._onDragStart);
      window.removeEventListener('resize', this._onResize);
      if (this._onMouseUp) {
         document.removeEventListener('onmouseup', this._onMouseUp);
      }
      if (this._onMouseMove) {
         document.removeEventListener('onmousemove', this._onMouseMove);
      }
   };

   // Получить сумку по элементу
   GameLibra.prototype._getBagByElement = function(element) {
      return this._aBags[element.gamelibraBagIndex];
   };

   // Сброс состояния весов в дефолт
   GameLibra.prototype._reset = function() {
      // Победы нет
      this._isVictory = false;

      // Список всех сумок
      this._aBags = [];

      // Сумки в панели сумок
      this._aBagsOnPanel = {};

      // Сумки в левой чаше
      this._aBagsOnBowlLeft = {};

      // Сумка в правой чаше
      this._aBagsOnBowlRight = {};
   };

   // Создание сумок
   GameLibra.prototype._createBags = function() {
      var
         self = this,
         gameBagsPanelCss = getComputedStyle(this._elements.gameBagsPanel),
         gameBagPanelWidth = parseInt(gameBagsPanelCss.width, 10) / this._options.bagsCount / 2,
         gameBagPanelHeight = parseInt(gameBagsPanelCss.height, 10),
         aBagsZ,
         weigthLast;

      // Две чаши
      for (var b = 0, bagsView = []; b < 2; b++) {
         weigthLast = 600;
         for (var i = 0; i < this._options.bagsCount; i++) {
            var bagWeight, el, oView;

            // Вес
            bagWeight = (i === this._options.bagsCount - 1) ? weigthLast : getNumRandom(60, 100);
            weigthLast -= bagWeight;

            // Создаем элемент сумки
            el = document.createElement('img');

            // Внешний вид сумки
            bagsView = bagsView.length ? bagsView : [].concat(this._options.bags);
            oView = bagsView.splice(getNumRandom(0, bagsView.length - 1), 1)[0];
            this._aBags.push({
               el: el,
               weight: bagWeight,
               view: oView
            });
         }
      }

      // Перемешиваем массив если не включен изи мод
      if (!this._options.easyMode) {
         this._aBags.sort(function() {
            return Math.random() - Math.random();
         });
      }

      // Dставляем сумки в панель
      this._aBags.forEach(function(bag, i) {
         var
            el = bag.el,
            offsets = getBagPanelMeddleOffsets(bag, i, gameBagPanelWidth, gameBagPanelHeight);

         // Присваиваем index
         el.gamelibraBagIndex = i;

         // По дефолтну сумки в панели
         self._aBagsOnPanel[i] = bag;

         //внешний вид сумки
         el.src = './img/bags/' + bag.view.img;
         el.style.width = bag.view.w + 'px';
         el.style.height = bag.view.h + 'px';
         el.className = 'gameLibra__bag';

         // Позиция на панели
         el.style.left = offsets.left + 'px';
         el.style.top = offsets.top + 'px';

         bag.lastLeft = offsets.left;
         bag.lastTop = offsets.top;
         bag.lastParent = self._elements.gameBagsPanel;

         // Вставляем сумку
         self._elements.gameBagsPanel.appendChild(bag.el);
      });

      // Cортируем по убыванию размеров, что бы меньшие сумки были с большим z-index
      aBagsZ = [].concat(this._aBags);
      aBagsZ.sort(function(a, b) {
         // Cортируем по той стороне, где разница в размерах наибольшая
         if (Math.abs(a.view.w - b.view.w) > Math.abs(a.view.h - b.view.h)) {
            return b.view.w - a.view.w;
         } else {
            return b.view.h - a.view.h;
         }
      });

      // Изменяем z-index что бы мелкие сумки были на первом плане
      aBagsZ.forEach(function(bag, i) {
         bag.el.style.zIndex = i + 100;
      });
   };

   // Переместить сумку
   GameLibra.prototype._moveBag = function(bag) {
      var
         boundBowlLeftDrop = this._elements.gameBowlLeftDrop.getBoundingClientRect(),
         boundBowlRightDrop = this._elements.gameBowlRightDrop.getBoundingClientRect(),
         boundBagsPanel = this._elements.gameBagsPanel.getBoundingClientRect(),
         boundBag = bag.el.getBoundingClientRect(),
         bagCenterX,
         bagCenterY,
         bagIndex,
         top,
         left,
         topNew,
         leftNew,
         parent,
         lastBound;

      bagCenterX = boundBag.left + boundBag.width / 2;
      bagCenterY = boundBag.top + boundBag.height / 2;

      // Если втсавка в левую чашу
      if (boundBowlLeftDrop.left <= bagCenterX
         && boundBowlLeftDrop.right >= bagCenterX
         && boundBowlLeftDrop.top - 20 <= bagCenterY
         && boundBowlLeftDrop.bottom + 20 >= bagCenterY) {
         top = boundBag.top - boundBowlLeftDrop.top;
         topNew = boundBowlLeftDrop.height - boundBag.height;
         left = boundBag.left - boundBowlLeftDrop.left;
         leftNew = Math.max(5, left);
         leftNew = Math.min(boundBowlLeftDrop.width - 5 - boundBag.width, leftNew);
         parent = this._elements.gameBowlLeftDrop;

      // Если в правую чашу
      } else if (boundBowlRightDrop.left <= bagCenterX
         && boundBowlRightDrop.right >= bagCenterX
         && boundBowlRightDrop.top - 20 <= bagCenterY
         && boundBowlRightDrop.bottom + 20 >= bagCenterY) {
         top = boundBag.top - boundBowlRightDrop.top;
         topNew = boundBowlRightDrop.height - boundBag.height;
         left = boundBag.left - boundBowlRightDrop.left;
         leftNew = Math.max(5, left);
         leftNew = Math.min(boundBowlRightDrop.width - 5 - boundBag.width, leftNew);
         parent = this._elements.gameBowlRightDrop;

      // Если в панель сумок
      } else if (boundBagsPanel.left <= bagCenterX
         && boundBagsPanel.right >= bagCenterX
         && boundBagsPanel.top <= bagCenterY
         && boundBagsPanel.bottom >= bagCenterY) {
         top = boundBag.top - boundBagsPanel.top;
         topNew = boundBagsPanel.height - boundBag.height - (boundBagsPanel.height - boundBag.height) / 2;
         left = boundBag.left - boundBagsPanel.left;
         leftNew = Math.max(5, left);
         leftNew = Math.min(boundBagsPanel.width - 5 - boundBag.width, leftNew);
         parent = this._elements.gameBagsPanel;

      // Попытка дропнуть в другие места
      } else {
         lastBound = bag.lastParent.getBoundingClientRect();
         top = boundBag.top - lastBound.top;
         left = boundBag.left - lastBound.left;
         topNew = bag.lastTop;
         leftNew = Math.max(5, bag.lastLeft);
         leftNew = Math.min(lastBound.width - 5 - boundBag.width, leftNew);
         parent = bag.lastParent;
      }

      // Положение до анимации перемещения
      bag.el.style.top = top + 'px';
      bag.el.style.left = left + 'px';
      parent.appendChild(bag.el);

      // Получением высоты вызываем перерисовку перед применением анимации
      bag.el.offsetHeight;

      // Запускаем анимации
      bag.el.addEventListener('transitionend', transitionCallback);
      bag.el.style.transition = 'top 0.3s ease-out 0s, left 0.3s ease-out 0s';
      bag.el.style.top = topNew + 'px';
      bag.el.style.left = leftNew + 'px';

      // Если родитель изменился - меняем сумке позицию
      if (parent !== bag.lastParent) {
         bagIndex = bag.el.gamelibraBagIndex;

         // Удаляем сумку из всех списков
         delete this._aBagsOnPanel[bagIndex];
         delete this._aBagsOnBowlLeft[bagIndex];
         delete this._aBagsOnBowlRight[bagIndex];

         // Добавляем
         if (parent === this._elements.gameBagsPanel) {
            this._aBagsOnPanel[bagIndex] = bag;
         } else if (parent === this._elements.gameBowlLeftDrop) {
            this._aBagsOnBowlLeft[bagIndex] = bag;
         } else if (parent === this._elements.gameBowlRightDrop) {
            this._aBagsOnBowlRight[bagIndex] = bag;
         }

         bag.lastTop = topNew;
         bag.lastLeft = leftNew;
         bag.lastParent = parent;

         // Калькуляция весов
         this._calc();
      }

      function transitionCallback(e) {
         if (e.target !== bag.el || e.propertyName !== 'top') {
            return;
         }
         bag.el.style.transition = '';
         bag.el.removeEventListener('transitionend', transitionCallback);
      }
   };

   // Изменение весов
   GameLibra.prototype._calc = function() {
      var
         self = this,
         weightBowlLeft = 0,
         weightBowlRight = 0,
         countBagsLeft = 0,
         countBagsRight = 0,
         bowlHeightDefault = 100,
         animateTimeMin = 0.6,
         animateTimeMax = 2,
         angleScale,
         bowlHeight,
         animateTime,
         delta,
         sign,
         i;

      // Считаем вес и кол-во сумок в левой чаше
      for (i in this._aBagsOnBowlLeft) {
         if (this._aBagsOnBowlLeft.hasOwnProperty(i)) {
            weightBowlLeft += this._aBagsOnBowlLeft[i].weight;
            countBagsLeft++;
         }
      }

      // Считаем вес и кол-во сумок в правой чаше
      for (i in this._aBagsOnBowlRight) {
         if (this._aBagsOnBowlRight.hasOwnProperty(i)) {
            weightBowlRight += this._aBagsOnBowlRight[i].weight;
            countBagsRight++;
         }
      }

      // Победа?
      if (countBagsLeft === this._options.bagsCount
         && countBagsLeft === countBagsRight && weightBowlLeft === weightBowlRight) {
         this._isVictory = true;
      }

      delta = (weightBowlRight - weightBowlLeft === 0) ? 0 : (weightBowlRight - weightBowlLeft) / 600;
      sign = delta < 0 ? -1 : 1;
      delta = Math.abs(delta);
      angleScale = sign * Math.min(90, delta * 90);
      bowlHeight = sign * Math.min(bowlHeightDefault, bowlHeightDefault * delta);
      animateTime = animateTimeMin / delta;
      animateTime = Math.min(animateTimeMax, animateTime);

      /**
       * TODO Глянуть что тут за анимация, возможно дичь
       */
      this._elements.gameScaleArrow.style.transition = 'transform ' + animateTime + 's cubic-bezier(.08,.75,.23,1) 0s';
      this._elements.gameDeviceLeft.style.transition = 'height ' + animateTime + 's cubic-bezier(.08,.75,.23,1) 0s';
      this._elements.gameDeviceRight.style.transition = 'height ' + animateTime + 's cubic-bezier(.08,.75,.23,1) 0s';

      this._elements.gameScaleArrow.addEventListener('transitionend', animateCallback);

      this._elements.gameScaleArrow.style.transform = 'rotate(' + angleScale + 'deg)';
      this._elements.gameDeviceLeft.style.height = bowlHeightDefault + bowlHeight  + 'px';
      this._elements.gameDeviceRight.style.height = bowlHeightDefault - bowlHeight + 'px';

      // Колбэк анимации
      function animateCallback(e) {
         if (e.target !== self._elements.gameScaleArrow || e.propertyName !== 'transform') {
            return;
         }
         if (self._isVictory) {
            self._elements.gameVictory.style.display = 'block';
         }
         self._elements.gameScaleArrow.removeEventListener('transitionend', animateCallback);
      }
   };

   // Сохранить опции
   GameLibra.prototype._setOptions = function(options) {
      this._options = Object.assign({}, OPTIONS_DEFAULT, typeof options === 'object' ? options : {});
   };

   // Получить элементы по селекторам
   GameLibra.prototype._getElements = function(selector) {
      var game = document.querySelector(selector);
      return game ? {
         game: game,
         gameDeviceLeft: game.querySelector('.gameLibra__device-left'),
         gameDeviceRight: game.querySelector('.gameLibra__device-right'),
         gameBowlLeftDrop: game.querySelector('.gameLibra__bowl-left-drop'),
         gameBowlRightDrop: game.querySelector('.gameLibra__bowl-right-drop'),
         gameScaleArrow: game.querySelector('.gameLibra__scale-arrow'),
         gameBagsPanel: game.querySelector('.gameLibra__bags-panel'),
         gameVictory: game.querySelector('.gameLibra__victory')
      } : {};
   };

   // Получить рандомное число
   function getNumRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   // Обработчик нажатия на кнопку мыши
   function onMouseDown(e) {
      var
         self = this,
         bag = this._getBagByElement(e.target),
         elBound,
         started,
         page;

      /**
       * Прерываем если
       * Сумки нет на элементе
       * Игра закончена
       * Нажата не левая кнопка
       */
      if (!bag || this._isVictory || e.which !== 1) {
         return;
      }

      //позиции мыши и курсора
      elBound = bag.el.getBoundingClientRect();
      page = {x: e.pageX, y: e.pageY};

      // Обработчик движения мыши
      this._onMouseMove = function onMouseMove(e) {
         if (!started && (Math.abs(page.x - e.pageX) > 2) || Math.abs(page.y - e.pageY) > 2) {
            started = true;
            self._elements.game.appendChild(bag.el);
         }
         if (started) {
            bag.el.style.top = e.pageY - page.y + elBound.top + 'px';
            bag.el.style.left = e.pageX - page.x + elBound.left + 'px';
         }
      };

      // Обработчик отжатия мыши
      this._onMouseUp = function onMouseUp(e) {
         if (e.which !== 1) {
            return true;
         }
         if (started) {
            self._moveBag(bag);
         }
         document.removeEventListener('mouseup', self._onMouseUp);
         document.removeEventListener('mousemove', self._onMouseMove);
         delete this._onMouseUp;
         delete this._onMouseMove;
      };

      document.addEventListener('mouseup', this._onMouseUp);
      document.addEventListener('mousemove', this._onMouseMove);
   }

   // Обработчик дефолтного переноса картинок, запрещаем его
   function onDragStart(e) {
      e.preventDefault();
   }

   /**
    * Обработчик изменения размеров страницы
    * Изменяем положение сумок, которые выкателись за пределы чаш весов или панели сумок
    */
   function onResize() {
      [this._aBagsOnPanel, this._aBagsOnBowlLeft, this._aBagsOnBowlRight].forEach(function(bags, index) {
         var
            width = 0,
            parent,
            boundParent,
            panelCss,
            panelWidth,
            panelHeight;

         if (index === 0) {
            panelCss = getComputedStyle(this._elements.gameBagsPanel);
            panelWidth = parseInt(panelCss.width, 10) / this._options.bagsCount / 2;
            panelHeight = parseInt(panelCss.height, 10);
            parent = this._elements.gameBagsPanel;
         } else if (index === 1) {
            parent = this._elements.gameBowlLeftDrop;
         } else {
            parent = this._elements.gameBowlRightDrop;
         }
         boundParent = parent.getBoundingClientRect();

         for (var i in bags) {
            if (bags.hasOwnProperty(i)) {
               var
                  bag = bags[i],
                  boundBag = bag.el.getBoundingClientRect();

               if (index === 0) {
                  //bag.el.style.top = getBagPanelMeddleOffsets(bag, 1, panelWidth, panelHeight).top;
               }

               // Если сумка вышла за пределы
               if (boundBag.right > boundParent.right) {
                  width += boundBag.width;
                  bag.el.style.left = boundParent.width - width - 5 + 'px';
                  this._moveBag(bag);
               }
            }
         }
      }.bind(this));
   }

   // Получить отступы сумки в панели
   function getBagPanelMeddleOffsets(bag, index, bagPanelWidth, bagPanelHeight) {
      return {
         left: index * bagPanelWidth + ((bagPanelWidth - bag.view.w) / 2),
         top: Math.max(0, (bagPanelHeight - bag.view.h) / 2)
      };
   }
})();
