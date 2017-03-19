# О чем игра
Это простая игра-головоломка развивающая зрительную память.

# Правила
Необходимо выровнять весы, используя все сумки. 
В каждой чаше весов, должно быть одинаковое количество сумок.
Размер сумки может не соответствовать ее размеру.
В каждой новой игре, вес сумок генерируется случайным образом.
В случае успеха, на весах будет написано "You Win!"

# Опции
В game.js доступны опции в объекте options:
1. bagsView - массив изображений сумок, состояший из объектов со свойствами img(название фотографии), w(ширина) и h(высота) фотографии.
Фотографии находятся в папке ./img/bags. 
Фотографии выбираются рандомно, если их меньше кол-ва сумок - используются повторно.
2. bagClass - css класс сумки
3. bagsCountOnBowl - кол-во сумок в одной чаше висов (определяет половину сумок от общего числа)
4. easyMode - легкий режим, в котором, сумки не перемешиваются в случайном порядке, а распологаются в нужном для победы порядке.
