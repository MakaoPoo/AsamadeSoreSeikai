$(function() {
  const config = {
    apiKey: "AIzaSyBJ9spM0Gq02Jrq55TutDHVSDXKVW_mlfc",
    authDomain: "asamadesoreseikai.firebaseapp.com",
    databaseURL: "https://asamadesoreseikai.firebaseio.com",
    storageBucket: "asamadesoreseikai.appspot.com",
  };
  firebase.initializeApp(config);

  const db = firebase.database();

  const dbQuestion = db.ref('/question');
  dbQuestion.on("value", function(snapshot) {
    const questionText = snapshot.val();
    const $odaiText = $('#odaitext');
    $odaiText.val(questionText).trigger('keyup');
    playSound(dededen);
  });

  for(let id = 0; id < 8; id++) {
    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    dbAnswer.on("value", function(snapshot) {
      const answerText = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $panelText = $user.find('.panel > p');
      $panelText.text(answerText);
    });

    const dbOpen = db.ref('/user_list/user' + id + '/is_open');
    dbOpen.on("value", function(snapshot) {
      const is_open = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $panel = $user.find('.panel');
      if(is_open) {
        if(!$panel.hasClass('open')) {
          playSound(deden);
        }
        $panel.addClass('open');
      } else {
        $panel.removeClass('open');
      }
    });

    const dbName = db.ref('/user_list/user' + id + '/name');
    dbName.on("value", function(snapshot) {
      const answerText = snapshot.val();
      const $user = $('.user[data-id="' + id + '"]');
      const $nameText = $user.find('.name > p');
      $nameText.text(answerText);
    });
  }

  $('.user').on('click', function() {
    if($(this).hasClass('selected')) {
      return;
    }
    const name = window.prompt("ユーザー名", "");

    if(name != "" && name != null) {
      const id = $(this).data('id');

      $('.user').removeClass('selected');
      $(this).addClass('selected');

      const dbName = db.ref('/user_list/user' + id + '/name');
      const dbAnswer = db.ref('/user_list/user' + id + '/answer');
      const dbOpen = db.ref('/user_list/user' + id + '/is_open');

      dbName.set(name);
      dbAnswer.set("");
      dbOpen.set(false);
    } else if(name == "") {
      window.alert("ユーザー名が入力されていません");
    }
  });

  $('.title').on('click', function() {
    const odaitext = $('#odaitext').val();

    const dbQuestion = db.ref('/question');
    dbQuestion.set(odaitext);
  });

  $('#open_btn').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const answer = $('#answer_input').val();
    if(answer == "" || answer == null) {
      window.alert('回答を入力してください');
      return;
    }

    const id = $selectUser.data('id');

    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    const dbOpen = db.ref('/user_list/user' + id + '/is_open');
    dbAnswer.set(answer);
    dbOpen.set(true);
  });

  $('#reset_btn').on('click', function() {
    const $selectUser = $('.user.selected');
    if($selectUser.length != 1) {
      window.alert('フリップを選択してください');
      return;
    }
    const id = $selectUser.data('id');

    const dbAnswer = db.ref('/user_list/user' + id + '/answer');
    const dbOpen = db.ref('/user_list/user' + id + '/is_open');
    dbAnswer.set("");
    dbOpen.set(false);
    $('#answer_input').val("");
  });

  $(window).on('resize', function() {
    $('#odaitext').trigger('keyup');
  });

  $('#odaitext').keyup(function() {
    $(this).css('height', 'auto');
    const height = $(this)[0].scrollHeight;
    $(this).css('height', height);
  });
});

let deden;
let dededen;
$(window).on('mousedown touchdown', function() {
  initWebAPI();

  loadSound("deden.wav", function(bufferData) {
    deden = bufferData;
  });

  loadSound("dededen.wav", function(bufferData) {
    dededen = bufferData;
  });

  $(window).off('mousedown touchdown');
});
