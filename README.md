# Vegan Recipe Hub

I want to create a web page focused on vegan recipes. 
It should have a landing page which will show the recipe for the day - show a random one from the catalog of recipes. Categorize the recipes in terms of difficulties or the user's cooking skills - beginner, intermediate, and expert. Also need to consider whether the user has any other allergy and avoid recipes mentioning those ingredients - sulphite, peanut, soy, gluten etc. 
Then an option to login or create the profile. The authentication mechanism needs to be robust and follow security best practices in terms of salting, enabling 2 factor authentication and social login via google and apple. The password needs to be combination of numbers, alphabets and characters. The logged in user can favorite recipes, get rewards for submitting new recipes - for now only vegacoins and a leaderboard for it, and future premium features which will be coming soon.
There should also be an option to submit new recipes which the user can use and then will be reviewed by the web admin before publishing it. It should include details such as difficulty level, ingredients, methods, cookware required, allergy information.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://veg-kitchen-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/922bdfe2-478b-4232-937c-4ffac3fc7e95).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
