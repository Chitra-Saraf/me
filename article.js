var route = require('express').Router();

const { Users, Relationships, Articles } = require('../models')

const SequelizeSlugify = require('sequelize-slugify')



async function createArticle(articleOpts, username) {
 
 
    if (!articleOpts.title) {
      throw new Error('Did not supply title')
    }
  
    SequelizeSlugify.slugifyModel(Articles, {
      source: ['title']
    });
  
    if (!articleOpts.description) {
      throw new Error('Did not supply description')
    }
    if (!articleOpts.body) {
      throw new Error('Did not supply body')
    }
  
    const article = await Articles.create({
      ...articleOpts, 
       authorUsername: username,
       userUsername: username
    })
  
    if (!article) {
      throw new Error('Error creating user')
    }
  
    const createdArticle = await Articles.findOne({
      attributes: ['title', 'description', 'body'],
      where: {
        title: article.title
      }
    })
  
    return {
      ...createdArticle.get(),
      
    }
  }

  
//Get article with slug value
async function getArticle(getthearticle){
  const garticle = await Articles.findOne({
    attributes: ['slug', 'title', 'description', 'body','createdAt','updatedAt'],
      where : {
          slug : getthearticle
      },
      include: [{model:Users, as:'author',attributes:['username','bio','image'] }]
  })
 
  console.log(garticle)
  if (garticle == null ) return {'message':'No Article with this slug'}
  else 
  return garticle
} 
  
async function deleteArticle(slugvalue, username){

  // get the logged in user
  const user = await Users.findOne({
    where : {
      username : username 
    }
  })

  // to get the article via slug 
  const article = await Articles.findOne({
    where : {
      slug : slugvalue
    }
  })

  if(!article)
  {throw new Error('No article found with the following name')};

  console.log(article);
  console.log(user);
  //If the user name of logged in user and article username does not match, throw an error
  if(user.username != article.userUsername)
  {throw new Error('Cannot delete SomeOne Else\'s Article \n Please Provide Slug of your article only')};

  const deletedArticle = await Articles.destroy({
      where : {
          slug : slugvalue
      }
  })

  if(deletedArticle == 0) return {'message':'No Article Deleted'};
  else return {'message':'Article has been Deleted'};

}


async function updateArticle(slug,username,articleOpts){
  // get the logged in user
  const user = await Users.findOne({
    where : {
      username : username 
    }
  })

  // to get the article via slug 
  const article = await Articles.findOne({
    where : {
      slug : slug
    }
  })

  if(!article)
  {throw new Error('No article found with the following name')};

  if(user.username != article.userUsername)
  {throw new Error('Cannot update SomeOne Else\'s Article \n Please Provide Slug of your article only')};

  const updatedArticle = await Articles.update(articleOpts,{
    where : {
      slug : slug
    }
  })

  if(updatedArticle ==1)
  {
    return getArticle(slug);
  }
  
}

//List articles or get all articles 
async function listArticles(author,limit,offset){
if(limit == undefined){
  limit = 20
}

if(offset == undefined){
  offset=0
}

if(author == undefined)
{
  const getall = await Articles.findAll({
    attributes: ['slug', 'title', 'description', 'body' , 'createdAt', 'updatedAt'],
    include: [{model:Users, as:'author', attributes:['username', 'bio' , 'image']}],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['updatedAt', 'DESC']]
  })
 
  if(getall == 0) return {'message':'No Article found'};
  else return {getall};
}
  else {
   const getall = await Articles.findAll({
      attributes: ['slug', 'title', 'description', 'body' , 'createdAt', 'updatedAt'],
      where: {authorUsername: author},
      include: [{model:Users, as:'author', attributes:['username', 'bio' , 'image']}],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt' , 'DESC']] })
      if(getall == 0) return {'message':'No Article found with authorname as that mentioned'};
      else return {getall};
}
}

//Feed Articles

async function feedArticles(follower,limit,offset){

  if(limit == undefined) {limit=20};
  if(offset == undefined) {offset=0};

  const usersFollowing=await Users.findOne({
    attributes: ['username'],
    where: {
      username : follower
  }
  })

 const followingStr = await Relationships.findAll({
    attributes: ['followed_username'],
    where : {
      follower_username: follower
    }
  })
  let a = followingStr.map( b => b.followed_username );

  let finalArticleList= [];
  for(var i=0; i<a.length;i++){
    const allArticles = await Articles.findAll({
      attributes: ['slug', 'title', 'description', 'body','createdAt','updatedAt'],
      where: {authorUsername : a[i]},
      include: [{model:Users, as:'author',attributes:['username','bio','image'] }],
      limit : parseInt(limit),
      offset : parseInt(offset),
      order: [['updatedAt', 'DESC']]
    })
    console.log(i+'\n\n\n')  
    finalArticleList.push(allArticles);
 }

  console.log(finalArticleList)
return(finalArticleList)
}

 
module.exports = {
  createArticle ,getArticle, deleteArticle , updateArticle, listArticles, feedArticles}