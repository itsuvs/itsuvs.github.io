---
layout: blog
title: "How to Build a GitHub Page using Jekyll"
category: Tech
---

Building a personal website or a blog has never been easier thanks to GitHub Pages and Jekyll. Jekyll is a simple, blog-aware, static site generator that transforms your plain text into static websites and blogs. GitHub Pages then hosts these sites for free, directly from your GitHub repository.

In this guide, I'll walk you through the steps to set up Jekyll on your macOS and get your website up and running.

<br>
## **1. Setting Up Jekyll on macOS**
<br>

Before you start, you'll need to have **Homebrew** installed on your Mac. If you don't have it, you can install it from [brew.sh](https://brew.sh/).

<br>

### *Step 1: Install Ruby*

<br>

macOS comes with Ruby pre-installed, but it's often an older version. It's recommended to install a newer version via Homebrew.

<br>

```bash
brew install ruby
```

<br>

Add these lines to your `~/.zshrc` or `~/.bash_profile` to use the Homebrew Ruby:

<br>

```bash
export PATH="/usr/local/opt/ruby/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/ruby/lib"
export CPPFLAGS="-I/usr/local/opt/ruby/include"
```

<br>

### *Step 2: Install Jekyll and Bundler*

<br>

Once Ruby is set up, you can install Jekyll and Bundler (which manages Gem dependencies).

<br>

```bash
gem install jekyll bundler
```
<br>

## **2. Creating and Running Your Jekyll Website**

<br>

Now that Jekyll is installed, let's create a new site.

<br>
```bash
jekyll new my-awesome-site
cd my-awesome-site
```
<br>

To run your website locally and see it in action, use the following command:

<br>

```bash
bundle exec jekyll serve
```
<br>

Your site will be available at `http://localhost:4000`. Any changes you make to your files will automatically trigger a rebuild, and you can see them live by refreshing your browser.

<br>

## **3. Understanding the Jekyll Structure**

<br>

Jekyll follows a specific directory structure that makes it easy to manage your content and design.

<br>

- **`_layouts/`**: This directory contains templates that wrap your content. For example, a `default.html` layout might contain the header and footer, while a `post.html` layout (which inherits from `default`) provides the structure for blog posts.
- **`_posts/`**: This is where your blog posts live. They must be named with the format `YEAR-MONTH-DAY-title.md`.
- **`_site/`**: After Jekyll processes your files, the resulting static website is placed here. You typically don't edit files in this folder.
- **`index.html` or `index.md`**: This is your site's landing page.
- **`Gemfile`**: Lists the Ruby gems required for your site.

<br>

## **4. How Layouts and Pages Work**

<br>

Jekyll uses **YAML Front Matter** at the top of each file to determine how it should be processed.

<br>

### --Layouts--
Layouts are just HTML files in the `_layouts` folder. They use double curly braces `{{ "{{" }} content }}` to specify where the page-specific content should be injected.

<br>

Example `_layouts/default.html`:

<br>

```html
<!DOCTYPE html>
<html>
  <body>
    <header> My Header </header>
    {{ "{{" }} content }}
    <footer> My Footer </footer>
  </body>
</html>
```
<br>

### --Pages and Posts--
Each page or post specifies which layout it uses in its Front Matter.

<br>

Example `index.html`:
```markdown
---
layout: default
title: Home
---

# Welcome to my site!
This content will be injected into the `default` layout.
```

<br>

When you run `jekyll serve`, Jekyll combines the content with the layout and generates a final HTML file in the `_site` directory.

<br>

## **5. Hosting on GitHub Pages**

<br>

To host your site, simply create a repository on GitHub named `username.github.io` (replace `username` with your GitHub username) and push your Jekyll site to the `main` branch. GitHub will automatically detect the Jekyll site and build it for you!

<br>

That's it! You're now ready to start blogging with Jekyll and GitHub Pages. Happy coding!
