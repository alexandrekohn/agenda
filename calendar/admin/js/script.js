var loading = "<td colspan='4' style='text-align: center; padding: 50px 0px;'>Carregando agendamentos...</td>";
var not_found = "<td colspan='4' style='text-align: center; padding: 50px 0px;'>Nenhum agendamento encontrado</td>";

var modal_original = { header: $(".modal-header").html(),
						 body: $(".modal-body").html(),
						 footer: $(".modal-footer").html() };

var ySelected, mSelected;

$(function() {
	tbody = $("tbody");
	time_format = $("#timeFormat").val();

	loadTable();

	$("#config").on("click", function() {
		$("#section").load("./php/config.php");
	});

	$("button.add").on("click", function() {
		$(".modal-header").html(modal_original.header);
		$(".modal-body").html(modal_original.body);
		$(".modal-footer").html(modal_original.footer);

		$("#inputDate").datepicker({ firstDay: 1 });

		if (time_format == "standard") {
			$("#inputTime").timepicker({
				timeFormat: 'hh:mm tt'
			});
		}
		else {
			$("#inputTime").timepicker();
		}

		$("button#add").on("click", function() {
			form = { title: $("#inputTitle").val(),
					 location: $("#inputLocation").val(),
					 date: $("#inputDate").val(),
					 time: $("#inputTime").val() };

			title = form.title;
			loc = form.location;
			date = new Date(form.date);
			date = date.getFullYear() + "-" +
				   (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-" +
				   (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
			time = form.time;
			
			if (time_format == "standard") {

				if (time.indexOf("am") > -1) {
					
					time = form.time.split(" ")[0];
					original = time.split(":");
					
					if (parseInt(original[0]) == 12) {
						time = "00:" + original[1];
					}
				}
				else {
					time = form.time.split(" ")[0];
					original = time.split(":");

					if (parseInt(original[0]) != 12) {
						timePm = parseInt(original[0]) + 12;
						time = timePm + ":" + original[1];
					}
				}
			}

			timestamp = date + " " + time;
			console.log(timestamp);

			if ((title && loc && form.date && form.time) != '') {
				form_data = { 1: title, 2: loc, 3: timestamp };
				addEvent(form_data);
			}
			else {
				alert("Ocorreu um erro. Verifique as informações e tente novamente.");
			}
		});
	});

	$("#myModal").on("hidden.bs.modal", function () {
		$("td").removeClass("active");
	});

	var years = new Date().getFullYear();
	var months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	for (i = years - 0; i <= years + 3; i++) {
		$(".searchbox").find(".sortYear .dropdown-menu").append("<li><a href='javascript:void(0)' id='" + i + "'>" + i + "</a></li>");
	}
	
	for (i = 1; i <= months.length - 1; i++) {
		$(".searchbox").find(".sortMonth .dropdown-menu").append("<li><a href='javascript:void(0)' id='" + i + "'>" + months[i] + "</a></li>");
	}

	$(".searchbox").delegate("a", "click", function() {
		if ($(this).attr("id") !== null && $(this).attr("id").length >= 4 && $(this).attr("id") !== ("ally" && "allm")) {
			var this_y = parseInt($(this).attr("id"));
			ySelected = this_y;
		}
		else if ($(this).attr("id") !== null && $(this).attr("id").length < 3) {
			var this_m = parseInt($(this).attr("id"));
			mSelected = this_m;
		}

		if ($(this).attr("id") === "ally") {
			this_y = undefined;
			ySelected = this_y;
		}
		else if ($(this).attr("id") === "allm") {
			this_m = undefined;
			mSelected = this_m;
		}

		$.ajax({
			type: "POST",
			dataType: "json",
			data: { action: "select", y: ySelected, m: mSelected },
			url: "./php/func_events.php",
			beforeSend: function() { tbody.html(loading); },
			success: function(data) {
				getEventsTable(data);
			},
			complete: function() {
				if (this_m !== undefined) { $(".sortMonth .dropdown-toggle").html(months[mSelected] + " <span class='caret'></span>") }
					else if (this_y === undefined) { $(".sortMonth .dropdown-toggle").html("Mês <span class='caret'></span>") }
				if (this_y !== undefined) $(".sortYear .dropdown-toggle").html(ySelected + " <span class='caret'></span>");
					else if (this_m === undefined) { $(".sortYear .dropdown-toggle").html("Ano <span class='caret'></span>") }
			},
			error: function() {
				tbody.html(not_found);
			}
		});
	});

	$("form#search>input:text").on("keyup", function() {
		search_q = $(this).serializeArray();
		search(search_q);
	});

	$("form#search").on("submit", function() {
		$(this).find("input[type='text']").blur();

		search_q = $(this).serializeArray();
		search(search_q);
	});

	$("#reverseList").on("click", function () { // Date.onclick function
		if (!$(this).children("span").hasClass('caret-reversed')) {
			$(this).children("span").addClass("caret-reversed");
		} else {
			$(this).children("span").removeClass("caret-reversed");
		}

		var listEvents = document.getElementById("listEvents");
		var i = listEvents.childNodes.length;

		while (i--)
		  listEvents.appendChild(listEvents.childNodes[i]);
	});
});

function loadTable() {
	$.ajax({
		dataType: "json",
		type: "POST",
		data: { action: "select" },
		url: "./php/func_events.php",
		beforeSend: function() { tbody.html(loading); },
		success: function(data) { getEventsTable(data); },
		error: function() {	tbody.html(not_found); }
	});
}

function getEventsTable(data) {
	tbody.empty();

	try {
		for (i = 0; i <= data.length; i++) {

			date = data[i].selector.split(" ");
			date = date[0] + " " + date[1] + " " + date[2];

			time = new Date(data[i].selector);

			time = {
				hours: time.getHours(),
				minutes: time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes(),
				ampm: (time.getHours() < 12 ? "am" : "pm")
			}

			if (time_format == "standard") {
				time.hours = (time.hours > 12) ? time.hours - 12 : time.hours;

				time = time.hours + ":" + time.minutes + time.ampm;
			}
			else if (time_format == "military") {
				time = time.hours + ":" + time.minutes;
			}

			timestamp = date + " " + time;

			var html = "<tr>" +
							"<td>" + data[i].name + "</td>" +
							"<td>" + data[i].phone + "</td>" +
							"<td>" + data[i].email + "</td>" +
							"<td>" + timestamp + "</td>" +
							"<td class='config'>" +
								"<div class='btn-group pull-right'>" +
									"<button href='javascript:void(0)' class='btn btn-default btn-small dropdown-toggle' data-toggle='dropdown'>" +
										"<span class='glyphicon glyphicon-cog'></span>" +
									"</button>" +
									"<ul class='dropdown-menu'>" +
										"<li>" +
											"<a class='edit' onclick=\"action('edit', '" + data[i].id + "|" +  escapeQuotes(data[i].name) + "|" + escapeQuotes(data[i].phone) + "|" + escapeQuotes(data[i].email) + "|" + data[i].selector + "')\" " +
												"href='#' data-toggle='modal' data-target='#myModal'>" +
													"<span class='glyphicon glyphicon-edit'></span>&nbsp;&nbsp;Edit" +
											"</a>" +
										"</li>" +
										"<li>" +
											"<a class='delete' onclick=\"action('del', '" + data[i].id + "', '" +  escapeQuotes(data[i].name) + "&nbsp;<br />&nbsp;" + escapeQuotes(data[i].phone) + "&nbsp;<br />&nbsp;" + escapeQuotes(data[i].email) + "&nbsp;<br />&nbsp;"  + data[i].selector + "')\"" +
												"href='#' data-toggle='modal' data-target='#myModal'>" +
													"<span class='glyphicon glyphicon-remove'></span>&nbsp;&nbsp;Delete" +
											"</a>" +
										"</li>" +
									"</ul>" +
								"</div>" +
							"</td>" +
						"</tr>";

			tbody.append(html);
		}
	}
	catch (e) {}
}
 
function action(action, data_id, data) {
	this.modal = { header: $(".modal-header>h3"),
				   body: $(".modal-body"),
				   footer: $(".modal-footer") };

	this.edit = function (data_id, data) {
		this.modal.header.html("Editar agendamento");
		this.modal.body.html(modal_original.body);
		this.modal.footer.html("<button type='button' id='edelete' class='btn btn-primary' data-loading-text='Editando...' data-complete-text='Agendamento salvo!'>SALVAR</button>");

		$("#inputDate").datepicker({ firstDay: 1 });
		
		if (time_format == "standard") {
			$("#inputTime").timepicker({
				timeFormat: 'hh:mm tt'
			});
		}
		else if (time_format == "military") {
			$("#inputTime").timepicker();
		}

		data_id = data_id.split("|");

		this.form = { name: data_id[1],
					  phone: data_id[2],
					  email: data_id[3],
					  timestamp: new Date(data_id[4]) };

		time = {
			hours: this.form.timestamp.getHours(),
			minutes: this.form.timestamp.getMinutes() < 10 ? "0" + this.form.timestamp.getMinutes() : this.form.timestamp.getMinutes(),
			ampm: (this.form.timestamp.getHours() <= 12 ? " am" : " pm")
		}

		if (time_format == "standard") {
			time.hours = (time.hours > 12) ? time.hours - 12 : time.hours;

			time = time.hours + ":" + time.minutes + time.ampm;
		}
		else if (time_format == "military") {
			time = time.hours + ":" + time.minutes;
		}

		$("#inputName").val(this.form.name.replace(/&sQuote;/g, "\'").replace(/&dQuote;/g, "\""));
		$("#inputPhone").val(this.form.phone.replace(/&sQuote;/g, "\'").replace(/&dQuote;/g, "\""));
		$("#inputEmail").val(this.form.email.replace(/&sQuote;/g, "\'").replace(/&dQuote;/g, "\""));
		$("#inputDate").val(((this.form.timestamp.getMonth()+1 < 10) ? "0" + (this.form.timestamp.getMonth()+1) : (this.form.timestamp.getMonth()+1)) + "/" + ((this.form.timestamp.getDate() < 10) ? "0" + (this.form.timestamp.getDate()) : (this.form.timestamp.getDate())) + "/" + this.form.timestamp.getFullYear());
		$("#inputTime").val(time);
	};
	this.del = function(data_id, data) {
		this.modal.header.html("Remover");

		time = data.split(" ");
		originalTime = time[time.length-1];
		time = originalTime.split(":");

		time = {
			hours: time[0],
			minutes: time[1],
			ampm: (time[0] <= 12 ? "am" : "pm")
		}

		if (time_format == "standard") {
			time.hours = (time.hours > 12) ? time.hours - 12 : time.hours;

			time = time.hours + ":" + time.minutes + time.ampm;

			data = data.replace(originalTime, time);
		}

		this.modal.body.html("<h3 style='text-align: center'>Você está removendo o agendamento de:</h3><br /><h4 style='text-align: center'>" + data.replace(/&sQuote;/g, "\'").replace(/&dQuote;/g, "\"") + "</h4>");
		this.modal.footer.html("<button type='button' id='edelete' class='btn btn-danger' data-loading-text='Removendo...' data-complete-text='Agendamento removido!'>REMOVER</button>");
	};
	
	this[action](data_id, data);
	var beforeSend = this[action](data_id, data);

	$("button#edelete").on("click", function () {
		var eDelete = $(this);

		timestamp = new Date($("#inputDate").val());
		timestamp = timestamp.getFullYear() + "-" +
					(timestamp.getMonth() + 1 < 10 ? "0" + (timestamp.getMonth() + 1) : timestamp.getMonth() + 1) + "-" +
					(timestamp.getDate() < 10 ? "0" + timestamp.getDate() : timestamp.getDate());

		if (action == "edit") {
			time = $("#inputTime").val();

			if (time_format == "standard") {
				if (time.indexOf("am") != -1) {
					time = time.split(" ")[0];
				}
				else {
					time = time.split(" ")[0];
					timePm = time.split(":");
					time = parseInt(timePm[0]) + 12 + ":" + timePm[1];
				}
			}
		}

		timestamp = timestamp + " " + time;

		this.newForm = { name: $("#inputName").val(),
						 phone: $("#inputPhone").val(),
						 email: $("#inputEmail").val(),
						 date: $("#inputDate").val(),
						 time: $("#inputTime").val(),
						 timestamp: timestamp };

		if (action == "edit") {
			if ((this.newForm.name || this.newForm.phone || this.newForm.email || this.newForm.date || this.newForm.time) == "") {
				alert("Ocorreu algum problema. Verifique e tente novamente.");
				return false;
			}
		}

		$.ajax({
			dataType: "json",
			type: "POST",
			data: { action: action, id: data_id, name: this.newForm.name, phone: this.newForm.phone, email: this.newForm.email, title: this.newForm.title, loc: this.newForm.loc, timest: this.newForm.timestamp },
			url: "./php/func_events.php",
			beforeSend: function() { eDelete.button("loading"); eDelete.attr("autocomplete", "off"); },
			complete: function() {
				if (action == "edit") {
					$(".header").after("<div class='alert alert-info'>" +
										"<a href='#' class='alert-link'>Agendamento</a> atualizado com sucesso!" +
										"</div>");
				}
				else {
					$(".header").after("<div class='alert alert-danger'>" +
										"<a href='#' class='alert-link'>Agendamento </a> removido com sucesso!" +
										"</div>");
				}

				var interval = setInterval(function() {
					(action == "edit") ? $(".alert-info").fadeOut() : $(".alert-danger").fadeOut();
				}, 2000);


				setTimeout(function() {
					clearInterval(interval);
				}, 2000);

				eDelete.prop("disabled", true);
				eDelete.html(eDelete.attr("data-complete-text"));

				$("#myModal").modal("hide");
				loadTable();
			}
		});
	});
}

function addEvent(form_data) {
	$.ajax({
		type: "POST",
		data: { action: "insert",
				title: form_data[1],
				loc: form_data[2],
				timest: form_data[3] },
		url: "./php/func_events.php",
		beforeSend: function() { $("button#add").button("loading") },
		success: function(data) {
			$("#myModal").modal("hide");
			$(".header").after("<div class='alert alert-success'>" +
							   "<b>Feito!</b> <a href='#'' class='alert-link'>Agendamento</a> criado com sucesso!" +
							   "</div>");

			setInterval(function() {
				$(".alert-success").fadeOut();
			}, 2000);

			loadTable();
		},
		error: function(err) { alert("Ocorreu um erro ao adicionar o agendamento."); }
	});
}

function search() {
	event.preventDefault();

	search_q[search_q.length] = { "name": "action", "value" : "select" };

	$.ajax({
		type: "POST",
		dataType: "json",
		data: search_q,
		url: "./php/func_events.php",
		beforeSend: function() { tbody.html(loading); },
		success: function(data) {
			getEventsTable(data);
		},
		error: function() { tbody.html(not_found); }
	});
}

function escapeQuotes(str) {
	str = str.replace(/\'/g, "&sQuote;").replace(/\"/g, "&dQuote;");

    return str;
}