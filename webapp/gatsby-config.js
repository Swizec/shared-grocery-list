module.exports = {
    siteMetadata: {
        title: `A shared grocery list 🛍`,
        description: `Share grocery lists with your friends`,
        author: `@swizec`,
    },
    plugins: [
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: `${__dirname}/src/images`,
            },
        },
        {
            resolve: "gatsby-source-graphql",
            options: {
                typeName: "GROCERIES",
                fieldName: "groceryapi",
                url: "https://z1kksu6iwb.execute-api.us-east-1.amazonaws.com/dev/query",
                // url: 'https://api.graphcms.com/simple/v1/swapi'
            },
        },
        `gatsby-transformer-sharp`,
        `gatsby-plugin-sharp`,
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: `shared-grocery-list`,
                short_name: `groceries`,
                start_url: `/`,
                background_color: `#663399`,
                theme_color: `#663399`,
                display: `minimal-ui`,
                icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
            },
        },
        // this (optional) plugin enables Progressive Web App + Offline functionality
        // To learn more, visit: https://gatsby.dev/offline
        // 'gatsby-plugin-offline',
    ],
}