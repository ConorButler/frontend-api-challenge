const renderAuthoredPeep = (peep, peepid) => {
  let likes = peep.likes.length
  if (likes === 0) {
    likes = ""
  }
  let date = new Date(peep.updated_at).toString();
  date = date.substring(0, 21);
  // to be improved
  return (
    `<div class="peep" data-peep-id="${peepid}">
      <img class="peep__author-pic" src="/images/red_egg.jpeg"></img>
      <div class="peep__main">
        <div class="peep__header">
          <div class="peep__author-handle">
            ${peep.user.handle} 
          </div>
          <div class="peep__time-since">
            ${date}
          </div>
        </div>
        <div class="peep__content">
          <div class="peep__text">
            ${peep.body}
          </div>
        </div>
        <div class="peep__footer">
          <img class="peep__like-icon" src="/images/like_icon.png" width="20" height="20"></img>
          <div class="peep__like-count" id="like-count-${peepid}">
            ${likes}
          </div>
          <img class="peep__delete-icon" id="delete-button-${peepid}" src="/images/delete_icon.png" width="20" height="20"></img>
        </div>
      </div>
    </div>`
  )
}
// delete button ids aren't necessary anymore but I've kept them for clarity
module.exports = renderAuthoredPeep
