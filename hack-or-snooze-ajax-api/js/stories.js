'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

let ownStoriesList;

let myFavoritesList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

async function myOwnStories() {
  ownStoriesList = await currentUser.ownStories;
  myStoriesList();
}

function myStoriesList() {
  $ownStoriesList.empty();
  let $ownStory;
  for (let story of ownStoriesList) {
    if (
      currentUser.favorites.some((value) => value.storyId === story.storyId)
    ) {
      $ownStory = generateStoryMarkup(story);
      $ownStory.find('.fa-star').toggleClass('fa-regular fa-solid');
    } else {
      $ownStory = generateStoryMarkup(story);
    }
    $ownStoriesList.append($ownStory);
  }
}

async function myFavorites() {
  myFavoritesList = await currentUser.favorites;
  addFavorites();
}

function addFavorites() {
  $favoritesList.empty();
  for (let story of myFavoritesList) {
    const $myFavoritesList = generateStoryMarkup(story);
    $myFavoritesList.find('.fa-star').toggleClass('fa-regular fa-solid');
    $favoritesList.append($myFavoritesList);
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function toFavorite(e) {
  e.preventDefault();
  if ($(this).children().hasClass('fa-regular')) {
    const targetStoryId = $(this).parent().get(0).id;
    currentUser.turnFavorite(targetStoryId);
    $(this).children().toggleClass('fa-regular fa-solid');
  } else if ($(this).children().hasClass('fa-solid')) {
    const targetStoryId = $(this).parent().get(0).id;
    currentUser.deleteFavorite(targetStoryId);
    $(this).children().toggleClass('fa-regular fa-solid');
  }
  if ($(this).parent().parent().parent().attr('id') === 'favorites') {
    let parentLi = $(this).parent().get(0);
    setTimeout(function (e) {
      parentLi.remove();
    }, 80);
  }
}

$(document).on('click', '.favorite-icon', toFavorite);

async function deleteStory(e) {
  const targetStoryId = $(this).parent().get(0).id;
  if ($(this).siblings().get(4).id === currentUser.username) {
    $(this).parent().remove();
    await storyList.deleteStory(currentUser, targetStoryId);
  } else {
    alert("You can't delete someone else's story");
  }
}

$(document).on('click', '.delete-icon', deleteStory);

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
     <li id="${story.storyId}"><a href="#" style="margin-right: 8px" class="delete-icon"><i class="fa-solid fa-trash-can"></i></a><a href="#" class="favorite-icon"><i class="fa-regular fa-star"></i></a>
        <a href="${story.url}" target="a_blank" class="story-link"> 
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user" id=${story.username}>posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug('putStoriesOnPage');
  $allStoriesList.empty();
  let $story;
  for (let story of storyList.stories) {
    if (currentUser !== undefined) {
      if (
        currentUser.favorites.some((value) => value.storyId === story.storyId)
      ) {
        $story = generateStoryMarkup(story);
        $story.find('.fa-star').toggleClass('fa-regular fa-solid');
      } else {
        $story = generateStoryMarkup(story);
      }
    } else if (currentUser === undefined) {
      $story = generateStoryMarkup(story);
    }
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function postStory(e) {
  e.preventDefault();
  const author = $('#author-text').val();
  const title = $('#title-text').val();
  const url = $('#url-text').val();
  await storyList.addStory(currentUser, author, title, url);
  location.reload();
}

$storyForm.on('submit', postStory);
