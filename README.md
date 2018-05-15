# О чем игра
Это простая игра-головоломка развивающая зрительную память.

# Правила
Необходимо выровнять весы, используя все сумки. 
В каждой чаше весов, должно быть одинаковое количество сумок.
Размер сумки может не соответствовать ее размеру.
В каждой новой игре, вес сумок генерируется случайным образом.
В случае успеха, на весах будет написано "You Win!"

# Опции
1. bags - массив изображений сумок, состояший из объектов со свойствами img(название файла), w(ширина) и h(высота) фотографии.
Фотографии находятся в папке ./img/bags.
2. selector - селектор контейнера с игрой
Фотографии выбираются рандомно, если их меньше кол-ва сумок - используются повторно.
3. bagsCount - кол-во сумок в одной чаше висов (определяет половину сумок от общего числа)
4. easyMode - легкий режим, в котором, сумки не перемешиваются в случайном порядке, а распологаются в нужном для победы порядке.

# Методы
1. start() - запуск игры (рестарт игры)
2. destroy() - уничтожаем экземпляр игры

# Пример
Предварительно нужно подключить js файл:
```html
<script type="text/javascript" src='./game/js/libra.js'></script>
```
Базовая разметка
```html
<div class='gameLibra'>
    <div class='gameLibra__main'>
        <div class='gameLibra__device-left'>
            <div class='gameLibra__bowl-left'>
                <div class='gameLibra__bowl-left-drop'></div>
            </div>
        </div>
        <div class='gameLibra__device-center'>
            <div class='gameLibra__scale'>
                <div class='gameLibra__scale-bg-wrap'>
                    <div class='gameLibra__scale-bg'></div>
                    <div class='gameLibra__scale-arrow'></div>
                </div>
            </div>
            <div class='gameLibra__victory'>
                <span class='gameLibra__victory-massage'>You Win!</span>
            </div>
        </div>
        <div class='gameLibra__device-right'>
            <div class='gameLibra__bowl-right'>
                <div class='gameLibra__bowl-right-drop'></div>
            </div>
        </div>
    </div>
    <div class='gameLibra__bags-panel'></div>
</div>
```

Минимум кода в js:
```javascript
// Создаем экземпляр
var gameLibra = new GameLibra({
    selecor: '#gameLibra',
    easyMode: true
});

// Стартуем игру
gameLibra.start();
```
