$(function() {

	let user = {
		currentUser: null,

		getUser: function(){
			$.ajax({
			    type: "POST",
			    url: '/get-user',
				beforeSend: function(){
			    },
			    data: {
				  'getUser': true,
				  'csrfmiddlewaretoken': getCookie("csrftoken"),
			    },
			    dataType: 'json',
			    success: function (data) {
			      if(data.username){
					   menu.showUser(data.username);
					   menu.favs = data.favorites;
	 				   menu.getFavourites();
				  }
			    }
		  });
		},
	}

	let film = {
		img: $('.generated-film__info--img img'),
		title: $('.generated-film__info--detail .title'),
		overview: $('.generated-film__overview'),
		genre: $('.generated-film__info--detail .genre'),
		runtime: $('.generated-film__info--detail .runtime .time'),
		countries: $('.generated-film__info--detail .runtime .countries'),
		releaseDate: $('.generated-film__info--detail .runtime .release-date'),
		voteCount: $('.generated-film__info--detail .ratings .votes .bot'),
		voteAverage: $('.generated-film__info--detail .ratings .votes .top'),
		popularity: $('.generated-film__info--detail .ratings .rating .top'),
		backdrop: $('.generated-film__backdrop'),
		video: $('.generated-film__video iframe'),
		cast: $('.generated-film__cast'),
		currentFilm: null,
		currentType: 'movie',

		show: function(data){
			film.img.attr('src', 'https://image.tmdb.org/t/p/w500/' + data.poster_path);
			film.backdrop.css({'background-image':  'url(https://image.tmdb.org/t/p/original/' + data.backdrop_path + ')'});
			film.title.html(data.title);
			film.releaseDate.html(data.release_date.split('-')[0]);
			film.overview.html(data.overview);
			film.voteCount.html(data.vote_count + ' голосов');
			film.voteAverage.html(data.vote_average * 10 + '%');
			film.popularity.html(data.popularity);

			$('title').text(data.title);

			if(data.is_favorite){
				$('#add-to-fav').hide();
				$('#remove-from-fav').show();
			}else{
				$('#add-to-fav').show();
				$('#remove-from-fav').hide();
			}

			let runtime = Math.floor(data.runtime / 60) + 'h ' + data.runtime % 60 + 'm';
			film.runtime.html(runtime);

			let genres = '';
			for(let i = 0; i < data.genres.length; i++){
				genres += data.genres.length == 1 || i == data.genres.length-1 ? data.genres[i].name : data.genres[i].name + ', '
			}
			film.genre.html(genres);


			let countries = '';
			for(let i = 0; i < data.production_countries.length; i++){
				countries += data.production_countries.length == 1 || i == data.production_countries.length-1 ? data.production_countries[i].iso_3166_1 : data.production_countries[i].iso_3166_1 + ', '
			}
			film.countries.html(countries);

			let videoUrl = data.video_trailer.results.length > 0 ? data.video_trailer.results[0].key : null;
			if(videoUrl != null){
				film.backdrop.addClass('--video');
				film.video.attr("data-src", "http://www.youtube.com/embed/" + videoUrl + '?autoplay=1&enablejsapi=1');
				let dataSrc = film.video.attr("data-src");
				$('.generated-film__backdrop').on('click', function(){
					$(".generated-film__video").show();
					$(this).addClass("hide");
					film.video.attr("src", dataSrc);
				});
			}else{
				film.backdrop.removeClass('--video');
				film.video.attr("data-src", "");
				film.video.attr("src", "");
			}

			film.cast.html('');
			if(data.credits){
				data.credits.cast.forEach(function(actor, i, arr){
					let img = actor.profile_path ? actor.profile_path : null;
					let nophoto = img == null ? 'nophoto' : '';
					film.cast.append(`
						<div class="cast-item">
			                <div class="img ` + nophoto +`" style="background-image: url(https://image.tmdb.org/t/p/w500/` + img + `">
								<svg>
				                    <use xlink:href="/static/img/sprite.svg#no-photo"></use>
				                </svg>
							</div>
			                <div class="actor-name">`+ actor.name +`</div>
			                <div class="character-name">` + actor.character + `</div>
			            </div>
						`);
				});
			}

			setTimeout(function(){
				$('.h__update').addClass('h__update--show');
				$('body').addClass('--generated-film');
				$('#get-film').hide();
				$('#generated-film').show();
				$('#generated-film, #header').animate({opacity: '1'}, 500);
				$('#generated-film, #header').removeClass('scale07');
			}, 500);
		},
		hide: function(){
			menu.close();
			film.video.attr("src", "");
			$('.generated-film__backdrop').removeClass("hide");
			$('#generated-film, #header').animate({opacity: '0'}, 500);
			$('#generated-film, #header').addClass('scale07');
		},

		addToFav: function(currentFilm, type){
			$.ajax({
			    type: "POST",
			    url: '/add-fav',
				beforeSend: function(){
					$('#add-to-fav').addClass('loading');
					$('.main-menu__loader').addClass('show');
					$('.main-menu').addClass('noscroll');
			    },
			    data: {
			      'csrfmiddlewaretoken': getCookie("csrftoken"),
				  'filmId': currentFilm.id,
				  'type': type,
			    },
			    dataType: 'json',
			    success: function (data) {
			      menu.favs = data.favorites;
				  $('.main-menu__loader').removeClass('show');
				  $('.main-menu').removeClass('noscroll');
				  if(data.fav_add){
					  menu.addFav(currentFilm);
				  }else{
					  $('#add-to-fav').removeClass('loading');
					  $('.main-menu__loader').removeClass('show');
					  $('.main-menu').removeClass('noscroll');
					  menu.open();
				  }
			  },
			  error: function(){
				  $('.main-menu__loader').removeClass('show');
				  $('#add-to-fav').removeClass('loading');
				  $('.main-menu').removeClass('noscroll');
			  }
		  });
		},
		removeFav: function(id, type){
			$.ajax({
			    type: "POST",
			    url: '/remove-fav',
				beforeSend: function(){
					$('.main-menu__loader').addClass('show');
					$('.main-menu').addClass('noscroll');
			    },
			    data: {
			      'csrfmiddlewaretoken': getCookie("csrftoken"),
				  'filmId': id,
				  'type': type,
			    },
			    dataType: 'json',
			    success: function (data) {
					$('.main-menu__loader').removeClass('show');
					$('.main-menu').removeClass('noscroll');
				  if(id == film.currentFilm.id){
					 $('#add-to-fav').show();
	  				 $('#remove-from-fav').hide();
				  }
			      menu.favs = data.favorites;
				  menu.getFavourites();
			  },
			  error: function(){
				  $('.main-menu__loader').removeClass('show');
				  $('.main-menu').removeClass('noscroll');
			  }
		  });
		},

		generate: function(random, url, type){
			$.ajax({
			    type: "POST",
			    url: url,
				beforeSend: function(){
					film.hide();
					preloader.start();
			    },
			    data: {
			      'csrfmiddlewaretoken': getCookie("csrftoken"),
				  'random': random,
				  'type': type,
			    },
			    dataType: 'json',
			    success: function (data) {
				  setTimeout(function(){
					  window.history.pushState("", "Новый фильм", "/movie/" + data.id);
					  film.show(data);
				  }, 600);
				  film.currentFilm = data;
			      console.log(data);
			  },
			  error: function(){
				  preloader.stop();
			  }
		  });
		},

	}

	let menu = {
		favs: null,

		sendFeedback: function(){
			let form_data = $('#feedback-form').serialize();
			$.ajax({
				type: "POST",
				url: '/feedback',
				beforeSend: function(){
					$('#send-feedback').addClass('loading');
				},
				data: form_data,
				dataType: 'json',
				success: function (data) {
					$('#send-feedback').removeClass('loading');
					$('.login-ok').addClass('show');
					$('#feedback').removeClass('show');
					setTimeout(function(){
						$('.login-ok').removeClass('show');
					}, 300);
				},
				error: function(){
					$('#send-feedback').removeClass('loading');
				}

		  });
		},
		addFav: function(currentFilm){
			$('#add-to-fav').removeClass('loading');
			$('#add-to-fav').hide();
			$('#remove-from-fav').show();
			let img = currentFilm.backdrop_path ? currentFilm.backdrop_path : currentFilm.poster_path
			$('#favs-empty').removeClass('show');
			$('.favorites').prepend(`
					<div class="fav-item"  style="background-image: url(https://image.tmdb.org/t/p/w500/` + img + `)">
						<a href="/movie/` + currentFilm.id + `"></a>
						<div class="fav-item__title">`+ currentFilm.title + `</div>
						<div class="fav-item__genre">` + currentFilm.genres[0].name + `</div>
						<div class="fav-item__icon" id="remove-fav" data-id="`+ currentFilm.id +`">
							<svg class="heart">
								<use xlink:href="/static/img/sprite.svg#fav"></use>
							</svg>
							<div class="minus"></div>
						</div>
					</div>
				`);
		},
		getFavourites: function(){
			$('.favorites').html('');
			if(menu.favs.length > 0){
				$('#favs-empty').removeClass('show');
				menu.favs.forEach(function(fav, i, arr){
					let img = fav.backdrop_path ? fav.backdrop_path : fav.poster_path;
					$('.favorites').prepend(`
						<div class="fav-item"  style="background-image: url(https://image.tmdb.org/t/p/w500/` + img + `)">
							<a href="/movie/` + fav.id + `"></a>
		                    <div class="fav-item__title">`+ fav.title + `</div>
		                    <div class="fav-item__genre">` + fav.genres[0].name + `</div>
		                    <div class="fav-item__icon" id="remove-fav" data-id="`+ fav.id +`">
		                        <svg class="heart">
		                            <use xlink:href="/static/img/sprite.svg#fav"></use>
		                        </svg>
								<div class="minus"></div>
		                    </div>
		                </div>
						`);
				});
			}else{
				$('#favs-empty').addClass('show');
			}
		},
		open: function(){
			$('body').addClass('opened-menu');
		},
		close: function(){
			$('body').removeClass('opened-menu');
		},
		showUser: function(name){
			$('.login-ok').addClass('show');
			$('.main-menu').addClass('noscroll');
			$('.user-img').html(name.split('')[0]);
			setTimeout(() => {
				$('#auth').hide();
				$('#user-info').show();
			}, 350);
			setTimeout(() => {
				$('.login-ok').removeClass('show');
				$('.main-menu').removeClass('noscroll');
			}, 500);
		},

		auth: {
			signupValidate: function(){
			   let regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			   let address = $('#signup-form input[name="email"]').val().trim();
			   if(regEmail.test(address) == false) {
				  menu.auth.addInpError($('#signup-form input[name="email"]'), 'Введите корректный e-mail');
			      return false;
			   }

			   let regUsername = /^(?=[a-zA-Z0-9._]{5,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
			   let username = $('#signup-form input[name="username"]').val().trim();
			   if(regUsername.test(username) == false) {
				  menu.auth.addInpError($('#signup-form input[name="username"]'), 'Логин введён некорректно');
			      return false;
			   }

			   let password = $('#signup-form input[name="password"]').val().trim();
			   let passwordRepeat = $('#signup-form input[name="password-repeat"]').val().trim();
			   if( password.length < 6){
				   menu.auth.addInpError($('#signup-form input[name="password"]'), 'Пароль не должен содержать менее 6 символов');
				   return false;
			   }

			   if(address == '' || username == '' || password == '' || passwordRepeat == ''){
				   menu.auth.addInpError($('#signup-form input'), 'Заполните все поля');
				    return false;
			   }
			  return true;
			},
			loginValidate: function(){
			   let username = $('#login-form input[name="username"]').val().trim();
			   let password = $('#login-form input[name="password"]').val().trim();
			   if(username == '' || password == ''){
				   menu.auth.addInpError($('#login-form input'), 'Заполните все поля');
				    return false;
			   }
			  return true;
			},
			signup: function(){
					let form_data = $('#signup-form').serialize();
					$.ajax({
						type: "POST",
						url: '/signup',
						beforeSend: function(){
							$('#signup-btn').addClass('loading');
						},
						data: form_data,
						dataType: 'json',
						success: function (data) {
							if(data.errors){
								$('#signup-btn').removeClass('loading');
								switch(data.errors[0].input){
									case 'email':
										menu.auth.addInpError($('#signup-form input[name="email"]'), data.errors[0].text);
										break;
									case 'username':
										menu.auth.addInpError($('#signup-form input[name="username"]'), data.errors[0].text)
										break;
									case 'password':
										menu.auth.addInpError($('#signup-form input[name="password"]'), data.errors[0].text)
										menu.auth.addInpError($('#signup-form input[name="password-repeat"]'), data.errors[0].text)
										break;
								}
							}
							if(data.login){
  							  menu.showUser(data.username);
							  menu.favs = data.favorites;
							  menu.getFavourites();
  						  }
					  	},
						error: function(){
							$('#signup-btn').removeClass('loading');
						}

				  });
			},
			login: function(){
					let form_data = $('#login-form').serialize();
					form_data.csrfmiddlewaretoken = $( "#login-form input[name='csrfmiddlewaretoken']" ).val();
					$.ajax({
						type: "POST",
						url: '/login',
						beforeSend: function(){
							$('#login-btn').addClass('loading');
						},
						data: form_data,
						dataType: 'json',
						success: function (data) {
						  if(data.login){
							  menu.showUser(data.username);
							  menu.favs = data.favorites;
							  menu.getFavourites();
						  }else{
							  $('#login-btn').removeClass('loading');
							  $('#login-form input').parent().find('.inp__error-text').html('Неверный логин или пароль');
							  $('#login-form input').parent().addClass('error');
						  }
					  	},
					  	error: function(){
							$('#login-btn').removeClass('loading');
						}
				  });
			},
			showLogin: function(){
				$('#signup').animate({opacity: '0'}, 500);
				$('#signup').addClass('scale07');
				setTimeout(function(){
					$('#signup').addClass('hide');
					$('#login').removeClass('hide');
					$('#login').animate({opacity: '1'}, 500);
					$('#login').removeClass('scale07');
					$('#login-form input[name="username"]').focus();
				}, 500 );
			},
			showSignup: function(){
				$('#login').animate({opacity: '0'}, 500);
				$('#login').addClass('scale07');
				setTimeout(function(){
					$('#login').addClass('hide');
					$('#signup').removeClass('hide');
					$('#signup').animate({opacity: '1'}, 500);
					$('#signup').removeClass('scale07');
					$('#signup input[name="email"]').focus();
				}, 500 );
			},
			addInpError: function(inp, text){
				inp.parent().find('.inp__error-text').html(text);
				inp.parent().addClass('error');
			},
		}
	}

	let preloader = {
		start: function(){
			menu.close();
			$('#get-film, #header').animate({opacity: '0'}, 200);
			$('#get-film, #header').addClass('scale07');
		},
		stop: function(){
			menu.close();
			$('#get-film, #header').animate({opacity: '1'}, 200);
			$('#get-film, #header').removeClass('scale07');
		}
	}

	user.getUser();

	let currentUrl = window.location.href;
	if(currentUrl.indexOf('/movie/') != -1){
	  film.generate(false, '', film.currentType);
  	}
	// Работа кнопок
	$('#close-menu').on('click', function(){
		menu.close();
	});
	$('#open-menu').on('click', function(){
		menu.open();
	});
	$('#header-get-film').on('click', function(){
		film.generate(true, '/', film.currentType);
	});
	$('#add-to-fav').on('click', function(){
		film.addToFav(film.currentFilm, film.currentType);
	});
	$('#remove-from-fav').on('click', function(){
		film.removeFav(film.currentFilm.id, 'movie');
		$(this).hide();
		$('#add-to-fav').show();
	});
	$('#signup-btn').on('click', function(){
		if(menu.auth.signupValidate()){
			menu.auth.signup();
		}
	});
	$('#login-btn').on('click', function(){
		if(menu.auth.loginValidate()){
			menu.auth.login();
		}
	});
	$(document).on('click', '#remove-fav', function () {
		let id = $(this).attr('data-id');
		film.removeFav(id, 'movie');
	});
	$('#show-login').on('click', function(){
		menu.auth.showLogin();
	});
	$('#show-signup').on('click', function(){
		menu.auth.showSignup();
	});

	$('#show-feedback').on('click', function(){
		$('#feedback').addClass('show');
		$('.main-menu').addClass('noscroll');
	});

	$('#send-feedback').on('click', function(){
		if($('#feedback-form input[name="name"]').val().trim() != '' && $('#feedback-form textarea[name="text"]').val().trim() != ''){
			menu.sendFeedback();
		}else{
			menu.auth.addInpError($('#feedback-form input[name="name"]'), 'Заполните все поля');
		}
	});

	$('#hide-feedback').on('click', function(){
		$('#feedback').removeClass('show');
		$('.main-menu').removeClass('noscroll');
	});

	// Работа кнопок END
	$('input').on('focus', function(){
		$(this).parent().removeClass('error');
	});

	// AJAX ЗАПРОС на рандомный фильм без фильтров
	$('#get-film').on("submit", function(){
		event.preventDefault();
		film.generate(true, '/', film.currentType);
	});
	function getCookie(c_name)
{
    if (document.cookie.length > 0)
    {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1)
        {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
 }

});
