
## What it enables

- This will allow the community locales to be integrated inside future builds.

- The changes that you make to the locales whilst you work on the game will be added alongside your code.

- The use of country-specific locale codes (like `fr-FR` instead of just `fr`) allows to have different versions of the localization for different regions if needed. This will come in handy soon with Portuguese.

- This structure allows to handle localization of media or more text files, not only a single json file. (I know you don't want to localize images for now, but it could be useful in the future)

- It allows the community to have an overview of the localization status of each language in the automated `README.md`, and track the incompatibilities via automated reports.

- It sorts the locales indifferent categories via the `Locales/index.json` file :

  - `completelocales` : locales that have text and media files compatible with the game
  - `validtextlocales` : locales that have text files compatible with the game, but no media files
  - `alllocales` : all locales, including incomplete ones.

  This allows you to be flexible about your integration strategy. that way you can choose easier what to use ingame an also enables you to warn users when a locale is not fully up to date (ex: ``Español (México) *partial*``)

- It provides guidelines and procedures to guide new contributors.

- The credits system allows you to reference contributors ingame if you want to, as well as not touching the `README.md`.

## Limits

- It requires some setup on your side to integrate it within your game project. You will need to change the way you load localization files to match this structure.

- As the locale project evolves alongside yours, you will need to pull from time to time.

- The audit system will provoke extra commit noise in the repository, as each PR that changes localization files will trigger an update of the `README.md` and `Locales/index.json` files. Therefore, I suggest to tweak a bit the discord bot so we don't get double notified when a change is made.

## How to integrate it within your game

Assuming you are properly versioning your game project with Git:

From the root of your unity project, add the modified project as a submodule
``` powershell
git submodule add git@github.com:Orsoniks/scavgame-locale.git Packages/com.cucommunity.locales
```

You can then start to reference the contents of the package in your project:

> This is example code, you might not want to use this.
``` csharp
using UnityEngine;

[System.Serializable]
public class LocaleIndex
{
    public string[] completelocales;
    public string[] validtextlocales;
    public string[] alllocales;
}

public static class LocaleLoader
{
    public static LocaleIndex LoadIndex()
    {
        var textAsset = Resources.Load<TextAsset>("Locales/index");
        if (textAsset == null)
        {
            Debug.LogError("Locales/index.json not found in Resources!");
            return null;
        }

        // Parse JSON into our struct
        return JsonUtility.FromJson<LocaleIndex>(textAsset.text);
    }
}
```
``` csharp
string json = await LocaleLoader.LoadIndexJsonAsync();
var data = JsonUtility.FromJson<LocaleIndex>(json);
Debug.Log($"Loaded {data.alllocales.Length} locales");
```

## What is left to discuss

- If you do end up wanting to integrate this, all the other pending PRs should be merged first, and I'll have to sync on my side so as to not wipe other's progress ;
- You might want to review and/or amend the ``CONTRIBUTING.md`` contents, to provide the instructions that match best your vision of community contributions ;
- You might also want to define a ``CODE-OF-CONDUCT.md``, I suggest taking inspiration from [here](https://github.com/sindresorhus/conduct/blob/main/code-of-conduct.md) ;
- You may want to pick a license for this repository, separating in rights between code, official game assets, and community contributed assets. The lack of any license leaves the repo material in an uncomfortable grey area ;
- I have also noticed that you don't have time for managing this repo. If you will allow me, I will gladly help you being a repo maintainer.

> best of courage