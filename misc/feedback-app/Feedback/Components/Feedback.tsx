import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Modal, Text, TextInput, Button } from 'react-native';
import { CheckBox } from 'react-native-elements'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import axios from 'axios';

interface IProps  {
    show: boolean,
    closeModal: Function,
}

interface IRequestBody {
    "userId"?: string,
    "productRating": string,
    "productVersion": string,
    "feedbackComments": string[],
    "productId"?: string
}

const feedbackTemplates = ["There was something wrong with the interface.", "The screen went blank in the middle", "The app went non-responsive for sometime.", "The app is laggy."]

const EMOJI_RANKING = [
    {
        labelOutline: "emoticon-frown-outline",
        labelFilled: "emoticon-frown",
    },
    {
        labelOutline: "emoticon-sad-outline",
        labelFilled: "emoticon-sad",
    },
    {
        labelOutline: "emoticon-neutral-outline",
        labelFilled: "emoticon-neutral",
    },
    {
        labelOutline: "emoticon-happy-outline",
        labelFilled: "emoticon-happy",
    },
    {
        labelOutline: "emoticon-excited-outline",
        labelFilled: "emoticon-excited",
    }
]

const MINIMUM_POSITIVE_RATING = 3;

const httpRequest = axios.create({
    baseURL: 'https://wznjlettbb.execute-api.us-east-1.amazonaws.com/qa/GT_AppFeedback/',
    timeout: 1000,
    proxy:{
        host: 'https://localhost',
        port: 8080
    }, 
    headers: {
        'origin': 'https://localhost:19006',
        'referer': 'https://localhost:19006/',
        'content-type': 'application/json'
    }  
});

const postData = async(rating: number, comments: string[]) => {
   
    const body: IRequestBody = {
        "userId": "1236",
        "productRating": rating.toString(),
        "productVersion": "1",
        "feedbackComments": comments,
        "productId": "prod_002530f0-4da6-11ec-bda2-8186c737d04e",
    }
    console.log(body);
  //  httpRequest.post('', JSON.stringify(body)).then((response) => {console.log({response})}).catch((e) => {console.log({e})})
}

const Feedback = (props: IProps) => {

    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState<Array<string>>([]);
    const [askDetailedFeedback, setAskDetailedFeedback] = useState(false);
    const [additionalComments, setAdditionalComments] = useState("");

    const resetState = () => {
        console.log("In reset state")
        setRating(0);
        setFeedbackText([""]);
        setAskDetailedFeedback(false);
        setAdditionalComments("")
    }

    const closeModal = () => {
        props.closeModal();
    }

    const renderTextInput = () => {
       return (
           <TextInput 
               style={styles.textInput}
               placeholder="Additional Comments"
               onChangeText={text => setAdditionalComments(text)}
               multiline
               value={additionalComments}
           />
       )
   }

    const starRatingHandler = (ratingClicked: number) => {
        setRating(ratingClicked);
        if(ratingClicked < MINIMUM_POSITIVE_RATING) {
            setTimeout(() => {
                setAskDetailedFeedback(true);
            }, 800)
        } else {
            setTimeout(() => {
                closeModal()
            }, 2000)
        }
    }

    useEffect(() => {
        if(rating >= MINIMUM_POSITIVE_RATING) {
            postData(rating, feedbackText);
        }
    }, [rating])

    const submitButtonHandler= () => {
        updateFeedbackText(additionalComments);
        closeModal()
        postData(rating, feedbackText)
    }

    const updateFeedbackText = (val: string) => {
        if(feedbackText.includes(val)) {
            const feedbackTextCopy = [...feedbackText];
            feedbackTextCopy.splice(feedbackTextCopy.indexOf(val));
            setFeedbackText(feedbackTextCopy);
        } else {
            const feedbackTextCopy = [...feedbackText];
            feedbackTextCopy.push(val);
            setFeedbackText(feedbackTextCopy);
        }
    }

    const renderRatingIcons = (i: number) => {
        const instance = EMOJI_RANKING[i];
        return (
            <MaterialCommunityIcons name= {rating < (i + 1) ? instance.labelOutline : instance.labelFilled} 
            size={28}
            style={{marginHorizontal: 10}}
            color="#fff" 
            onPress={() => {starRatingHandler(i+1)}}/>
        )
    }

    const StarRow = () => {
        return(
            <View style={{display: 'flex', flexDirection: 'row'}}>
                {EMOJI_RANKING.map((el, i) => {
                    return (
                        <View key={i}>
                            {renderRatingIcons(i)}
                        </View>
                    )
                })}
            </View>
        )
    }

    const StarFeedback = () => {
        
        return (
            <View style={styles.modalStyle}>
                <Text style={styles.headerText}>Please tell us how much do you love the app!</Text>
                <View style={{minHeight: 20}}></View>
                <StarRow/>
            </View>
        )
    }
    
    return (
        <View>
            <Modal visible={props.show}
                animationType="slide"
                transparent={true}>
                {askDetailedFeedback ? 
                    <View style={styles.modalStyle}>
                    <Text style={styles.headerText}>Please tell us how can we improve?</Text>
                    <View style={{...styles.alignItemsLeftProp, marginTop: 15}}>
                    {feedbackTemplates.map((val, i) => {
                        return(
                            <View key={i} style={styles.checkboxText}>
                                <CheckBox
                                    key={val}
                                    disabled={false}
                                    textStyle={{backgroundColor: '#252525', color:"#fff", fontWeight: "normal"}}
                                    containerStyle={{backgroundColor: '#252525', borderColor: 'transparent'}}
                                    title={val}
                                    checked={feedbackText.length > 0 && feedbackText.includes(val)}
                                    onPress={() => {updateFeedbackText(val)}}
                                />
                            </View>
                        )
                    })}
                    {renderTextInput()}
                    </View>
                    <View style={{display: 'flex', flexDirection: 'row', marginTop: 15}}>
                        <View style={{padding: 10, minWidth: '50%'}}>
                            <Button onPress={() => {props.closeModal(); resetState()}}
                                title="Skip"
                                color="#007ACC"
                                accessibilityLabel="Skip"
                            />
                        </View>
                        <View style={{padding: 10, minWidth: '50%'}}>
                            <Button onPress={() => {submitButtonHandler()}}
                                title="Submit"
                                color="#007ACC"
                                accessibilityLabel="Submit"
                            />
                        </View>
                    </View>
                </View>
                : <StarFeedback/>}
            </Modal>
        </View>
    )

}

const styles = StyleSheet.create({
    modalStyle: {
        margin: 11,
        marginTop: 'auto',
        color: 'white',
        backgroundColor: '#252525',
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        textAlign: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    alignItemsCenterProp: {
        alignItems: "center",
    },
    alignItemsLeftProp: {
        alignItems: "flex-start",
    },
    headerText: {
        color: "#fff",
        fontSize: 23,
        fontWeight: "bold",
        textAlign: 'center'
    },
    textInput: {
        marginTop: 10,
        marginLeft: 3,
        height: 80,
        borderWidth: 1,
        borderColor: "#444444",
        borderRadius: 5,
        minWidth: "100%",
        padding: 10,
        color: '#fff'
    },
    checkboxText: {
        textAlign: "left"
    }
})

export default Feedback;