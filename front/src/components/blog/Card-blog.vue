<template>
  <div id="card-box">
    <Card :bordered="false" class="card">
      <p id="title" slot="title">
        <span id="author">
          <Icon type="ios-person-add" />
          {{summary.author}}
        </span>

        <span @click="viewIt(summary._id)">
          <router-link :to="{name:'detail',query:{id:summary._id}}" id="title_a">{{summary.title}}</router-link>
        </span>
      </p>

      <p id="context">
        <span class="red">摘要：</span>
        {{summary.summary}}
        <span @click="viewIt(summary._id)">
          <router-link :to="{name:'detail',query:{id:summary._id}}" class="red">...【详情】</router-link>
        </span>
      </p>

      <div id="icons">
        <div class="left">
          <span>
            <Icon type="md-calendar" />
            <Time :time="time" type="datetime" />
          </span>
        </div>
        <div class="right">
          <span>
            <Icon :class="{voted:viewd}" type="md-eye" />
            {{summary.view}}
          </span>
          <span>
            <Icon :class="{voted:liked}" @click="voteIt(summary._id)" type="ios-thumbs-up" />
            {{summary.likes}}
          </span>
          <span>
            <Icon type="ios-text" />0
          </span>
        </div>
      </div>

      <!-- 清除浮动 -->
      <div style="clear:left;"></div>

      <!-- 标签 -->
      <p>
        <Tag :color="setColor(tag)" :key="tag" v-for="tag in tags">{{tag}}</Tag>
      </p>
    </Card>
  </div>
</template>
<script>
export default {
    props: ['summary'],
    data() {
        return {
            blog: this.summary,
            time: this.summary.c_date,
            viewd: false,
            liked: false,
            typeOfTags: [
                'default',
                'red',
                'volcano',
                'orange',
                'gold',
                'green',
                'cyan',
                'blue',
                'geekblue',
                'purple'
            ]
        }
    },
    computed: {
        tags: function() {
            return this.blog.category.split(/[,，]/)
        }
    },
    // created() {
    //   console.log(this.summary);
    // },
    methods: {
        // 设置标签颜色
        setColor: function(tag) {
            switch (tag) {
                case 'VUE':
                    return 'green'
                case '乱八七糟':
                    return 'default'
                case 'JavaScript':
                    return 'red'
                case 'Java':
                    return 'gold'
                case 'Python':
                    return 'cyan'
                case 'CSS':
                    return 'geekblue'
                case 'HTML':
                    return 'orange'
                case 'Node.JS':
                    return 'volcano'
                default:
                    return this.typeOfTags[parseInt(Math.random() * 10)]
            }
        },
        voteIt(id) {
            this.axios.get('/blogs/vote?id=' + id).then(res => {
                if (res.status == 200) {
                    this.$Message.success(res.data.msg)
                    this.summary.likes += 1
                    this.liked = true
                }
            })
        },
        viewIt(id) {
            this.axios.get('/blogs/view?id=' + id).then(res => {
                if (res.status == 200) {
                    this.summary.view += 1
                    this.viewd = true
                }
            })
        }
    }
}
</script>

<style scoped>
#card-box {
    width: 100%;
    margin: 0 auto;
    margin-bottom: 50px;
}

.voted {
    color: #ff6b6b !important;
}
.card {
    box-shadow: 0 0 30px #222;
    border-radius: 0;
    border: none;
}

.card:hover {
    transform: scale(1.05);
    -ms-transform: scale(1.05);
    -moz-transform: scale(1.05);
    -webkit-transform: scale(1.05);
    -o-transform: scale(1.05);
}

i {
    margin-top: -3px;
}
#title {
    text-align: justify;
}
#context {
    display: block;
}
#context .red {
    color: rgb(175, 50, 60);
}
#title a {
    color: rgb(175, 50, 60);
}
#author {
    width: 30%;
    display: inline-block;
}
#title_a {
    max-width: 40%;
}
#author i {
    font-size: 18px;
}

#icons {
    margin: 1em 0;
    width: 100%;
    display: block;
}
#icons .left {
    float: left;
    margin-left: 0px;
}

#icons .right {
    /* margin-right: 32px; */
    float: right;
}
.right i:hover {
    cursor: pointer;
    color: rgb(175, 50, 60);
}
#icons .right span {
    margin-left: 20px;
}
</style>
