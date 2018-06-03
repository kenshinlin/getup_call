<template>
<div class="text-center">
  <div class="demo-upload-list" v-for="item in uploadList">
    <template v-if="item.status === 'finished'">
        <img :src="item.url">
        <div class="demo-upload-list-cover">
            <!-- <Icon type="ios-eye-outline" @click.native="handleView(item.name)"></Icon> -->
            <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
        </div>
    </template>
    <template v-else>
        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
    </template>
  </div>
  <Upload
    ref="upload"
    :show-upload-list="false"
    :default-file-list="defaultList"
    :on-success="handleSuccess"
    :format="['jpg','jpeg','png']"
    :max-size="2048"
    :on-format-error="handleFormatError"
    :on-exceeded-size="handleMaxSize"
    :before-upload="handleBeforeUpload"
    :multiple="false"
    name="upfile"
    type="drag"
    action="//kk.kenniu.top/upload/fileupload"
    style="display: inline-block;width:58px;">
    <div style="width: 58px;height:58px;padding-top:10px;">
        <Icon type="camera" size="20"></Icon>
        <p>{{uploadList.length<1?"上传":"更换"}}头像</p>
    </div>
  </Upload>
</div>
</template>
<script>
import {IMG_HOST} from '../constants/'
const MAX_COUNT = 1

export default {
    props:['value'],
    data () {
        return {
            defaultList: [],
            imgName: '',
            uploadList: []
        }
    },
    methods: {
        handleRemove (file) {
            const fileList = this.$refs.upload.fileList;
            this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
        },
        handleSuccess (res, file) {
            console.log('上传完成', file)
            if( file.response && file.response.state=="SUCCESS"){
              file.url = IMG_HOST + file.response.url
              file.name = file.response.name;
              this.$emit('input', file.url)
            }
        },
        handleFormatError (file) {
            this.$Message.error(`${file.name}文件格式不对`);
        },
        handleMaxSize (file) {
            this.$Message.error(`文件太大${file.name}`);
        },
        handleBeforeUpload () {
            const check = this.uploadList.length < MAX_COUNT;
            if (!check) {
                this.$Message.error('只能上传一张');
            }
            return check;
        }
    },
    mounted () {
        this.uploadList = this.$refs.upload.fileList;
    }
}
</script>
<style>
    .demo-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
    }
    .demo-upload-list img{
        width: 100%;
        height: 100%;
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }
</style>
