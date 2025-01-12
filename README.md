# Anime Dub Status

A website for determining if an Anime has a dub available. https://animedubstatus.com/

Backend source can be found at https://github.com/grim3212/AnimeDubStatus-Infra

### Credits

The backend infrastructure for this utilizes a few sources that make the website possible.

- We utilize the `AGPL-3.0` licensed [dubInfo.json](https://github.com/MAL-Dubs/MAL-Dubs/blob/main/data/dubInfo.json) from [MAL-Dubs](https://github.com/MAL-Dubs/MAL-Dubs).
- We use the [currently airing anime](https://myanimelist.net/forum/?topicid=1692966) from MyAnimeList that [Kenny_Stryker](https://myanimelist.net/profile/Kenny_Stryker) maintains.
- The MyAnimeList API used extensively through the Python package [mal-api](https://pypi.org/project/mal-api/)


### Development

Built using [Nuxt 3](https://nuxt.com/docs/getting-started/introduction).

#### Setup

Make sure to install the dependencies:

```bash
yarn install
```

### Linting

Linting in the editor isn't showing warnings or working 100% right in VSCode currently but I don't have enough time to diagnose.

```bash
yarn lint
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

### Production

Build the application for production:

```bash
yarn build
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
