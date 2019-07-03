# Mobile Frontend v3

## Building project

To build the project, you have to download prerequisite [libs.zip](https://drive.google.com/file/d/1lmSLiDJGUsxU38KU2VoSea960aV9xqsx/view?usp=sharing) and extract it under `presentation/libs` folder, then copy `PayLib-release-1.4.17.aar` file to `sdk/libs`folder.

## Using Mika SDK

The documentation of Mika SDK can be found [here](https://drive.google.com/drive/folders/1JRBR8Ui5272r_XPvBtqqDSsePHg5pE20?usp=sharing)

### Generate documentation with Dokka
To generate the documentation, use the `dokka` Gradle task:

```bash
./gradlew dokka
```