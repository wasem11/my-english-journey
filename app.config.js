const {expo}=require('./app.json');

// The native app and Azure-hosted site keep their original configuration.
// Only the GitHub Pages export receives the repository subdirectory.
module.exports=()=>process.env.MEJ_GITHUB_PAGES==='1'?{
 ...expo,
 web:{...expo.web,bundler:'metro',output:'single'},
 experiments:{...expo.experiments,baseUrl:'/my-english-journey'},
}:expo;
