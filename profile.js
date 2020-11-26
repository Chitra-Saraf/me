const { Users, Relationships } = require('../models')

async function getProfile(optUsername){
    const user = await Users.findOne({
      attributes: ['username', 'bio', 'image'],
        where : {
            username : optUsername
        },
        include :[{model:Relationships, attributes:['followed_username']}]
  
    })
  
    console.log(user)
    return user
  
  }  


  //FOLLOW USER 

  async function FollowUser(relo, followerusername) {
 
    const ifalready = await Relationships.findOne({
      attributes: ['follower_username', 'followed_username'],
      where: {
        follower_username: followerusername,
        followed_username: relo
      }
    })
    if(ifalready) {
      throw new Error('Already following this user')
    } 
    
    if (!relo) {
      throw new Error('Did not supply name of user to be followed')
    }
  
    const follow = await Relationships.create({
      ...relo, 
       follower_username: followerusername,
       followed_username: relo
       
    })
  
    if (!follow) {
      throw new Error('Error following user')
    }
  
    const followeduser = await Relationships.findOne({
      attributes: ['follower_username', 'followed_username'],
      where: {
        followed_username: follow.followed_username
      }
    })
  
    return followeduser
  }

  //Unfollow User
   
async function Unfollow(relo , username ){
  
  const followed = await Relationships.findOne({
    where : {
      followed_username: relo,
      follower_username: username
    }
  })

  if(!followed )
  {throw new Error('You donot follow any user with this name')};

  const deletedfollowing = await Relationships.destroy({
      where : {
          follower_username: username,
          followed_username: relo
      }
  })

  if(deletedfollowing == 0) return {'message':'No User unfollowed'};
  else return {'message':'User has been unfollowed'};

}

  
  
module.exports = { getProfile, FollowUser, Unfollow}