<template>
  <Layout>
    <Header>
      <Row type="flex" justify="space-between">
        <Col span="6">
          <NuxtLink to="/">Home</NuxtLink>
        </Col>
        <Col>
          <h3>{{ title }} - {{ projectName }}</h3>
        </Col>
      </Row>
    </Header>
    <Content> <Nuxt /> </Content>
    <Footer
      style="display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'"
    >
      <div>
        <div>
          Copyright &copy; {{ companyName }}. All rights reserved.

          <span v-if="T_AND_C_URL">
            <a :href="T_AND_C_URL">Terms and conditions</a>
          </span>
        </div>
        <div>
          Powered by
          <a
            style="color: '#fff', textDecoration: 'underline'"
            href="https://graphile.org/postgraphile"
            >PostGraphile</a
          >
        </div>
      </div>
    </Footer>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
// import { NuxtLink } from "@nuxt/types";
import { Layout, Avatar, Row, Col, Dropdown, Icon, Menu } from "ant-design-vue";
import { projectName, companyName } from "@app/config";

@Component({
  components: {
    Layout,
    Header: Layout.Header,
    Avatar,
    Row,
    Col,
    Dropdown,
    Icon,
    Menu,
  },
})
export default class DefaultLayout extends Vue {
  data() {
    return {
      projectName,
      companyName,
      T_AND_C_URL: process.env.T_AND_C_URL,
    };
  }
}
</script>
<style lang="less" scoped>
img {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
