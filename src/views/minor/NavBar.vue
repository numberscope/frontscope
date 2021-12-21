<template>
<div>
        <nav class="navbar navbar-expand-lg navbar-light sticky-top" data-toggle="collapse"
        style="backgroundColor: #809fff;">
                <router-link :to="{ name: 'Home' }" class="navbar-brand">
                        <img class="orange" src="@/assets/imgs/MicroscopeLogo.png" width="210" height="40">
                </router-link>

                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mr-auto">
                                <li class="nav-item">
                                        <router-link :to="{ name: 'Home' }" class="orange nav-link">
                                                <font color="#fff"><b>The Scope</b></font>
                                        </router-link>
                                </li>

                                <li class="nav-item">
                                        <router-link :to="{ name: 'Home' }" class="orange nav-link">
                                                <font color="#fff"><b>Specimens</b></font>
                                        </router-link>
                                </li>

                                <li class="nav-item">
                                        <router-link :to="{ name: 'UserManual' }" class="orange nav-link">
                                                <font color="#fff"><b>User Manual</b></font>
                                        </router-link>
                                </li>

                        </ul>
                </div>
        </nav>
</div>
</template>

<script>

export default {
        name: 'NavBar',
}

</script>

<style>
.navbar {
        margin-bottom: 20px;
}
</style>