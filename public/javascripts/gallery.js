$(function(){
	var templates = {};
	var photos;

	$("script[type='text/x-handlebars']").each(function(){
		var $templ = $(this);
		templates[$templ.attr("id")] = Handlebars.compile($templ.html());
	});

	$("[data-type='partial']").each(function(){
		var partial = $(this);
		Handlebars.registerPartial(partial.attr("id"), partial.html())
	});

	$("#comments").on("submit", "form", function(e){
		e.preventDefault();
		var data = $(this).serialize();
		$.ajax({
			url: "/comments/new",
			data: data,
			method: "post",
			success: function(json){
				var html = templates.comment(json);
				$("#comments ul").append(html);
				e.target.reset();
			}
		})
	});


	$.ajax({
		url: "/photos",
		success: function(json){
			photos = json;
			$("#slides").append(templates.photos({photos: photos}));
			getPhotoInformationFor(photos[0]);
			getCommentsFor(photos[0].id);


		}
	})

	$(".next").on("click", function(e){
		e.preventDefault();
		var $current = $('figure:visible');
		var $next = $current.next();

		if (!$next.is("figure")){
			$next = $("figure:first-of-type");
		}

		var photo_id = +$next.attr("data-id");
		var nextPhoto = photos[photo_id-1];

		getPhotoInformationFor(nextPhoto);
		getCommentsFor(photo_id);

		$next.stop().fadeIn(500);
		$current.stop().fadeOut(500);
	});

	$(".prev").on("click", function(e){
		e.preventDefault();
		var $current = $("figure:visible");
		var $prev = $current.prev();
	

		if(!$prev.is("figure")){
			$prev = $("figure:last-of-type");
		}

		var photo_id = +$prev.attr("data-id");
		var previousPhoto = photos[photo_id-1];

		getPhotoInformationFor(previousPhoto);
		getCommentsFor(photo_id);

		$prev.stop().fadeIn(500);
		$current.stop().fadeOut(500);
	});


	function bindEventsToLike(){
		$("a.button.like").on("click", function(e){
			e.preventDefault();
			var photo_id = +$("figure:visible").attr("data-id");
			$.ajax({
				url: "/photos/like",
				method: "POST",
				data: "photo_id=" + photo_id,
				success: function(json){
					json.total++;
				}
			})
		})
	}

	function bindEventsToFavorite(){
		$("a.button.favorite").on("click", function(e){
			e.preventDefault();
			var photo_id = +$("figure:visible").attr("data-id");
			$.ajax({
				url: "/photos/favorite",
				method: "POST",
				data: "photo_id=" + photo_id,
				success: function(json){
					json.total++;
					$(e.target).attr("")
				}
			})
		})
	}


	function getPhotoInformationFor(photo){
		$("section > header").html(templates.photo_information(photo));
		bindEventsToLike();
		bindEventsToFavorite();
	};

	function getCommentsFor(id) {
		$.ajax({
			url: "/comments?photo_id=" + id,
			success: function(json){
				$("#comments ul").html(templates.comments({comments: json}))
			}
		})

	}

});