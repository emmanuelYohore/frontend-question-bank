<script lang="ts">
</script>

<template>
    <nav class="navbar">
  <input type="checkbox" id="toggle">
  <div class="logo">MySite</div>
  <label for="toggle" class="hamburger">☰</label>
  <ul class="menu">
    <li><a href="#">Home</a></li>
    
  </ul>
</nav>
</template>

<style scoped>
body {
  margin: 0;
  font-family: sans-serif;
}

.navbar {
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  position: relative;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.menu {
  list-style: none;
  display: flex;
  margin-left: auto;
}

.menu li a {
  color: white;
  text-decoration: none;
  padding: 0 15px;
  display: block;
  line-height: 60px;
}

.hamburger {
  display: none;
  font-size: 1.8rem;
  cursor: pointer;
  margin-left: auto;
}

#toggle {
  display: none;
}

/* Responsive Rules */
@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .menu {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: #333;
    flex-direction: column;
    display: none;
  }

  .menu li a {
    line-height: 40px;
    padding: 10px 20px;
  }

  #toggle:checked + .logo + .hamburger + .menu {
    display: flex;
  }
}
</style>