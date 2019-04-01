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
  $odaiText.val(questionText);
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
  const result = window.confirm('ユーザを変更しますか？');

  if(result) {
    const id = $(this).data('id');
    console.log(id);

    $('.user').removeClass('selected');
    $(this).addClass('selected');
  }
});

$('.title').on('click', function() {
  const odaitext = $('#odaitext').val();

  const dbQuestion = db.ref('/question');
  dbQuestion.set(odaitext);
});

$('#answer_btn').on('click', function() {
  const $selectUser = $('.user.selected');
  if($selectUser.length != 1) {
    window.alert('ユーザを選択してください');
    return;
  }
  const id = $selectUser.data('id');
  const answer = $('#answer_input').val();

  const dbAnswer = db.ref('/user_list/user' + id + '/answer');
  const dbOpen = db.ref('/user_list/user' + id + '/is_open');
  dbAnswer.set(answer);
  dbOpen.set(false);
});

$('#open_btn').on('click', function() {
  const $selectUser = $('.user.selected');
  if($selectUser.length != 1) {
    window.alert('ユーザを選択してください');
    return;
  }
  const id = $selectUser.data('id');

  const dbOpen = db.ref('/user_list/user' + id + '/is_open');
  dbOpen.set(true);
});

$('#name_btn').on('click', function() {
  const $selectUser = $('.user.selected');
  if($selectUser.length != 1) {
    window.alert('ユーザを選択してください');
    return;
  }
  const id = $selectUser.data('id');
  const name = $('#name_input').val();

  const dbAnswer = db.ref('/user_list/user' + id + '/name');
  const dbOpen = db.ref('/user_list/user' + id + '/is_open');
  dbAnswer.set(name);
  dbOpen.set(false);
});
