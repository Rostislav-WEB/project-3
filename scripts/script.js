'use strict';

// задаем const 
const headerCityButton = document.querySelector('.header__city-button');


// сохраняем хэш #kids #men #women
let hash = location.hash.substring(1);
/* substring обрезает символы
1 аргумент с какого символа
2 сколько символов */

// проверка city , если есть поменять текст
if (localStorage.getItem('lomoda-location')) {
	headerCityButton.textContent = localStorage.getItem('lomoda-location');
}

// Тоже самое что и if 
// headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?'

// слушатель событий на клик 
headerCityButton.addEventListener('click', () => {
	const city = prompt('Укажите Ваш город:');
	// меняется текст из переменной city
	headerCityButton.textContent = city;
	// браузерное хранилище , 'lomoda-location' - key 
	localStorage.setItem('lomoda-location', city);
});


// блокировка скролла
const disableScroll = () => {
/* window - браузерная модель , браузер
	 window.innerWidth - весь браузер, от левого края до правого
	 document.body.offsetWidth - часть от левого края до скролла, скролл не входит*/
	const widthScroll = window.innerWidth - document.body.offsetWidth;
	// сколько пикселей отмотали
	document.body.dbScrollY = window.scrollY;
	// шаблонные строки
	document.body.style.cssText = `
		position: fixed;
		top: ${-window.scrollY}px;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		padding-right: ${widthScroll}px;
	`;
	// document.body.style.overflow = 'hidden';

};

const enableScroll = () => {
		document.body.style.cssText = '';
		window.scroll({
			top: document.body.dbScrollY,
		});
	// document.body.style.overflow = '';

};


// модальное окно

const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

// функция открытие модального окна

const cartModalOpen = () => {
	cartOverlay.classList.add('cart-overlay-open');
	disableScroll();
};

// функция закрытие модального окна

const cartModalClose = () => {
	cartOverlay.classList.remove('cart-overlay-open');
	enableScroll();
};

// запрос базы данных , получение данные сервера

// оператор async 
const getData = async () => {
	const data = await fetch('db.json');
	if (data.ok) {
		//json преобразует данные в который нам нужен
		return data.json()
	} else {
		// исключение оператор throw , передает ошибку созданную вручную
		throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`)
	}
};


// передаем hash (value)
const getGoods = (callback, prop, value) => {
	getData()
			.then(data => {
				if (value) {
					callback(data.filter(item => item[prop] == value));
				} else {
					callback(data);
				}
			})
			// catch отлавливает ошибки
			.catch(err => {
				console.error(err);
			});
}; 
/* then - метод обработки промисов, он вызовет callback функцию, когда getData отработает, выполнит return */


// открытие корзины

subheaderCart.addEventListener('click', cartModalOpen);

// закрытие корзины

cartOverlay.addEventListener('click', event => {
	const target = event.target;
/* 		classList.contains() true/boolean если есть такой класс
	 .matches тоже самое что и classList.contain только поиск по селектору */
	if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
		cartModalClose();
	}
});

// СТРАНИЦА КАТЕГОРИЙ ТОВАРОВ
try {
	const goodsList = document.querySelector('.goods__list');
	if (!goodsList) {
		throw `This is not a goods page`;
	}

// меняем заголовок title
const goodsTitle = document.querySelector('.goods__title');

const changeTitle = () => {
		goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
}
// 
	// const createCard = data => {
	const createCard = ({ id, preview, cost, brand, name, sizes }) => {

		// получение данных из объекта

		/* const id = data.id;
		const preview = data.preview;
		const cost = data.cost;
		const brand = data.brand;
		const name = data.name;
		const sizes = data.sizes; */

/* 		деструктуризация 
		const { id, preview, cost, brand, name, sizes } = data; */
		// создаем элемент
		const li = document.createElement('li');
		// добавляем класс списку
		li.classList.add('goods__item');
		li.innerHTML = `
			<article class="good">
			<a class="good__link-img" href="card-good.html#${id}">
					<img class="good__img" src="goods-image/${preview}" alt="">
			</a>
			<div class="good__description">
					<p class="good__price">${cost} &#8381;</p>
					<h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
					${sizes ? 
						`<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
					''}
					<a class="good__link" href="card-good.html#${id}">Подробнее</a>
			</div>
	</article>
		`;
		/* ${sizes.join(' ') собираем каждый элемент из массива в строку а в скобках разделитель */
		return li;
	};
	// renderGoodsList callback function
	const renderGoodsList = data => {
		goodsList.textContent = '';
		// переборка данных
		// 1способ
		/* for (let i = 0; i < data.length; i++) {
			console.log('for: ', data[i]);
		} */
		// 2способ
		/* for (const item of data) {
			console.log('for/of:', item);
		} */
		// 3способ
		data.forEach((item, i, arr) => {
			const card = createCard(item);
			goodsList.append(card);

		})
	};
	// при изменение хэша будут происходить действия
	// getGoods очищает все карточки и заполняет новыми
	window.addEventListener('hashchange', () => {
		hash = location.hash.substring(1)
		getGoods(renderGoodsList, 'category', hash);
		changeTitle();

	})
	changeTitle();
	getGoods(renderGoodsList, hash);
} catch (err) {
		console.warn(err)
}


// страница корзины 

try {
	if (!document.querySelector('.card-good')) {
		throw 'This is not a card-good page';
	}
	const cardGoodImage = document.querySelector('.card-good__image');
	const cardGoodBrand = document.querySelector('.card-good__brand');
	const cardGoodTitle = document.querySelector('.card-good__title');
	const cardGoodPrice = document.querySelector('.card-good__price');
	const cardGoodColor = document.querySelector('.card-good__color');
	const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
	const cardGoodColorList = document.querySelector('.card-good__color-list');
	const cardGoodSizes = document.querySelector('.card-good__sizes');
	const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
	const cardGoodBuy = document.querySelector('.card-good__buy');

	// перебираем data с помощью reduce
	// reduce он принимает callback функцию и каждую следующую итерацию 
	// первый аргумент передает результат предыдущей итерацией этой callback функции
	// 2 параметром принимает какое то значение которое может быть самым первым значением

	const generateList = data => data.reduce((html, item, i) => html + 
	`<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');

	const renderCardGood = ([{brand, name, cost, color, sizes, photo}]) => {
		cardGoodImage.src = `goods-image/${photo}`;
		cardGoodImage.alt = `${brand} ${name}`;
		cardGoodBrand.textContent = brand;
		cardGoodTitle.textContent = name;
		cardGoodPrice.textContent = `${cost} ₽`;        
		if (color) {
				cardGoodColor.textContent = color[0];
				cardGoodColor.dataset.id = 0;
				cardGoodColorList.innerHTML = generateList(color);
		} else {
				cardGoodColor.style.display = 'none';
		}

		if(sizes) {
				cardGoodSizes.textContent = sizes[0];
				cardGoodSizes.dataset.id = 0;
				cardGoodSizesList.innerHTML = generateList(sizes);
		} else {
				cardGoodSizes.style.display = 'none';
		}
};
	// выпадающие списки
	cardGoodSelectWrapper.forEach(item => {
		// e - event
		item.addEventListener('click', e => {
			const target = e.target;
			if (target.closest('.card-good__select')) {
				// toggle как переключатель, добавляет класс если его нет и убирает если класс есть
					target.classList.toggle('card-good__select__open');
			}
			if (target.closest('.card-good__select-item')) {
					const cardGoodSelect = item.querySelector('.card-good__select');
					cardGoodSelect.textContent = target.textContent;
					// dataset - атрибут
					cardGoodSelect.dataset.id = target.dataset.id;
					cardGoodSelect.classList.remove('card-good__select__open');
			}
		});
	});

	// getGoods получает данные
	getGoods(renderCardGood, 'id', hash);
} catch (err) {
	console.warn(err);
}
